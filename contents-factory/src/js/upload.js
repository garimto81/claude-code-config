// Photo Factory - Upload Module
// Cloudinary API + RxDB integration (with Supabase sync)

import { getCurrentUser } from './auth-local.js';
import { jobsAPI, photosAPI, generateJobNumber as dbGenerateJobNumber, fileToBase64 } from './rxdb-api.js';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, APP_CONFIG } from './config.js';
import { UploadError, ValidationError, DatabaseError, handleError } from './utils/errors.js';
import { withRetry } from './utils/retry.js';

// 현재 작업 상태
let currentJob = {
  jobNumber: null,
  carModel: '',
  location: '',
  photos: {} // { category: [{ file, cloudinaryUrl, thumbnailUrl }] }
};

/**
 * 작업번호 자동 생성 (IndexedDB 버전)
 */
async function generateJobNumber() {
  try {
    const { data, error } = await dbGenerateJobNumber();

    if (error) {
      console.error('작업번호 생성 오류:', error);
    }

    return data;
  } catch (error) {
    console.error('작업번호 생성 오류:', error);
    // Fallback
    const timestamp = Date.now().toString().slice(-6);
    return `WHL${timestamp}`;
  }
}

/**
 * Cloudinary에 이미지 업로드 (재시도 로직 포함)
 * @param {File} file - 업로드할 파일
 * @returns {Promise<Object>} - { url, publicId, thumbnail }
 * @throws {ValidationError|UploadError}
 */
export async function uploadToCloudinary(file) {
  // 파일 크기 검증 (재시도 불가능한 에러)
  if (file.size > APP_CONFIG.maxFileSize) {
    throw new ValidationError(
      `파일 크기가 너무 큽니다. (최대 ${APP_CONFIG.maxFileSize / 1024 / 1024}MB)`,
      'fileSize'
    );
  }

  // 파일 타입 검증 (재시도 불가능한 에러)
  if (!APP_CONFIG.allowedFileTypes.includes(file.type)) {
    throw new ValidationError(
      `지원하지 않는 파일 형식입니다. (${file.type})`,
      'fileType'
    );
  }

  // 업로드 로직 (재시도 가능)
  return withRetry(
    async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'photo-factory');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new UploadError(
          `Cloudinary 업로드 실패: ${errorData.error?.message || response.statusText}`,
          errorData
        );
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
        thumbnail: data.secure_url.replace('/upload/', '/upload/c_thumb,w_300,h_300/'),
        width: data.width,
        height: data.height,
        size: data.bytes,
        format: data.format
      };
    },
    {
      maxRetries: 3,
      delayMs: 1000,
      onRetry: (attempt, maxRetries, delay) => {
        console.log(`📤 업로드 재시도 중... (${attempt}/${maxRetries})`);
      }
    }
  );
}

/**
 * 카테고리에 사진 추가
 * @param {string} category - 카테고리 ID
 * @param {File} file - 파일
 */
export async function addPhotoToCategory(category, file) {
  if (!currentJob.photos[category]) {
    currentJob.photos[category] = [];
  }

  // 카테고리당 최대 사진 수 확인
  if (currentJob.photos[category].length >= APP_CONFIG.photosPerCategory) {
    throw new Error(`카테고리당 최대 ${APP_CONFIG.photosPerCategory}장까지만 업로드 가능합니다.`);
  }

  // UI 업데이트: 업로드 중 표시
  const photoId = `photo-${category}-${Date.now()}`;
  displayUploadingPhoto(category, file, photoId);

  try {
    // Cloudinary 업로드
    const cloudinaryData = await uploadToCloudinary(file);

    // 로컬 상태에 추가
    currentJob.photos[category].push({
      file,
      cloudinaryUrl: cloudinaryData.url,
      thumbnailUrl: cloudinaryData.thumbnail,
      publicId: cloudinaryData.publicId,
      fileSize: cloudinaryData.size
    });

    // UI 업데이트: 업로드 완료
    displayUploadedPhoto(category, cloudinaryData, photoId);

    console.log(`✅ ${category} 사진 업로드 완료:`, cloudinaryData.url);

    return cloudinaryData;
  } catch (error) {
    // UI 업데이트: 오류 표시
    displayUploadError(category, error.message, photoId);
    throw error;
  }
}

/**
 * 작업 저장 (IndexedDB)
 */
export async function saveJob() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  // 필수 입력 검증
  if (!currentJob.carModel) {
    throw new Error('차종을 입력하세요.');
  }

  // 최소 1장 이상 사진 확인
  const totalPhotos = Object.values(currentJob.photos).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  if (totalPhotos === 0) {
    throw new Error('최소 1장 이상의 사진을 업로드하세요.');
  }

  try {
    // 1. jobs 테이블에 작업 정보 저장
    if (!currentJob.jobNumber) {
      currentJob.jobNumber = await generateJobNumber();
    }

    const jobResult = await jobsAPI.insert({
      job_number: currentJob.jobNumber,
      work_date: new Date().toISOString().split('T')[0],
      car_model: currentJob.carModel,
      location: currentJob.location || '',
      technician_id: user.id,
      status: 'uploaded'
    });

    if (jobResult.error) throw new Error(jobResult.error);

    const jobData = jobResult.data;
    console.log('✅ 작업 정보 저장:', jobData);

    // 2. photos 테이블에 사진 정보 저장
    const photoInserts = [];

    Object.entries(currentJob.photos).forEach(([category, photos]) => {
      photos.forEach((photo, index) => {
        photoInserts.push({
          job_id: jobData.id,
          category: category,
          cloudinary_url: photo.cloudinaryUrl,
          cloudinary_public_id: photo.publicId,
          thumbnail_url: photo.thumbnailUrl,
          file_size: photo.fileSize,
          sequence: index + 1
        });
      });
    });

    const photosResult = await photosAPI.insert(photoInserts);

    if (photosResult.error) throw new Error(photosResult.error);

    console.log(`✅ ${photosResult.data.length}장 사진 저장 완료`);

    return {
      success: true,
      job: jobData,
      photos: photosResult.data
    };
  } catch (error) {
    console.error('❌ 작업 저장 오류:', error);
    throw error;
  }
}

/**
 * UI 헬퍼: 업로드 중 표시
 */
function displayUploadingPhoto(category, file, photoId) {
  const container = document.getElementById(`photos-${category}`);
  if (!container) return;

  const preview = document.createElement('div');
  preview.id = photoId;
  preview.className = 'photo-preview uploading';
  preview.innerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">업로드 중...</span>
    </div>
    <p class="small mt-2 mb-0">업로드 중...</p>
  `;

  container.appendChild(preview);
}

/**
 * UI 헬퍼: 업로드 완료 표시
 */
function displayUploadedPhoto(category, cloudinaryData, photoId) {
  const preview = document.getElementById(photoId);
  if (!preview) return;

  preview.className = 'photo-preview uploaded';
  preview.innerHTML = `
    <img src="${cloudinaryData.thumbnail}" alt="${category}" class="img-thumbnail">
    <button type="button" class="btn-close btn-sm" onclick="removePhoto('${category}', '${photoId}')">
    </button>
    <div class="check-mark">✓</div>
  `;
}

/**
 * UI 헬퍼: 업로드 오류 표시
 */
function displayUploadError(category, errorMessage, photoId) {
  const preview = document.getElementById(photoId);
  if (!preview) return;

  preview.className = 'photo-preview error';
  preview.innerHTML = `
    <div class="text-danger">
      <i class="bi bi-exclamation-circle"></i>
      <p class="small mt-2">${errorMessage}</p>
    </div>
    <button type="button" class="btn btn-sm btn-outline-danger mt-2" onclick="retryUpload('${category}', '${photoId}')">
      재시도
    </button>
  `;
}

/**
 * 사진 제거
 */
window.removePhoto = function(category, photoId) {
  // UI에서 제거
  const preview = document.getElementById(photoId);
  if (preview) {
    preview.remove();
  }

  // 상태에서 제거 (간단 구현: 첫 번째 제거)
  if (currentJob.photos[category] && currentJob.photos[category].length > 0) {
    currentJob.photos[category].shift();
  }
};

/**
 * 작업 초기화
 */
export function resetJob() {
  currentJob = {
    jobNumber: null,
    carModel: '',
    location: '',
    photos: {}
  };
}

// currentJob export
export { currentJob };

// 전역 함수 노출
window.currentJob = currentJob;
window.addPhotoToCategory = addPhotoToCategory;
window.saveJob = saveJob;
window.resetJob = resetJob;

console.log('📤 Upload module loaded');
