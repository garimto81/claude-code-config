// Photo Factory - Configuration
// API Keys from Environment Variables (Vite)

// Supabase Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cloudinary API Configuration
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// App Configuration
export const APP_CONFIG = {
  appName: '5-Category 포토 팩토리',
  version: '1.0.0',
  categories: [
    { id: 'before_car', label: '입고', icon: '🚗', description: '작업 전 차량 전체' },
    { id: 'before_wheel', label: '문제', icon: '🔍', description: '손상된 휠 클로즈업' },
    { id: 'during', label: '과정', icon: '🔧', description: '작업 중 모습' },
    { id: 'after_wheel', label: '해결', icon: '✨', description: '복원 완료 휠' },
    { id: 'after_car', label: '출고', icon: '🚗', description: '작업 후 차량 전체' }
  ],
  photosPerCategory: 3, // 카테고리당 최대 사진 수
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

// Helper function to validate config
export function validateConfig() {
  const errors = [];
  const warnings = [];

  // Supabase 검증
  if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
    errors.push('❌ VITE_SUPABASE_URL이 설정되지 않았습니다.');
  } else if (SUPABASE_URL.includes('your-project')) {
    errors.push('❌ VITE_SUPABASE_URL을 실제 값으로 변경하세요.');
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined') {
    errors.push('❌ VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  } else if (SUPABASE_ANON_KEY.includes('your_anon')) {
    errors.push('❌ VITE_SUPABASE_ANON_KEY를 실제 값으로 변경하세요.');
  }

  // Cloudinary 검증
  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'undefined') {
    errors.push('❌ VITE_CLOUDINARY_CLOUD_NAME이 설정되지 않았습니다.');
  } else if (CLOUDINARY_CLOUD_NAME.includes('your_cloud')) {
    errors.push('❌ VITE_CLOUDINARY_CLOUD_NAME을 실제 값으로 변경하세요.');
  }

  if (!CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET === 'undefined') {
    errors.push('❌ VITE_CLOUDINARY_UPLOAD_PRESET이 설정되지 않았습니다.');
  } else if (CLOUDINARY_UPLOAD_PRESET.includes('your_upload')) {
    errors.push('❌ VITE_CLOUDINARY_UPLOAD_PRESET을 실제 값으로 변경하세요.');
  }

  // 에러가 있으면 상세 안내
  if (errors.length > 0) {
    console.error('❌ Configuration Errors:', errors);

    const errorMessage = `
⚠️ 환경변수 설정 오류

${errors.join('\n')}

해결 방법:
1. 프로젝트 루트에 .env 파일이 있는지 확인
2. .env.example을 복사하여 .env 생성
3. .env 파일에 실제 API 키 입력
4. Vite 개발 서버 재시작 (npm run dev)

자세한 내용: README.md의 "환경 설정" 섹션 참고
    `.trim();

    alert(errorMessage);
    return false;
  }

  console.log('✅ Configuration validated successfully');
  console.log('📊 Config:', {
    supabaseUrl: SUPABASE_URL?.substring(0, 30) + '...',
    cloudinaryName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET
  });

  return true;
}
