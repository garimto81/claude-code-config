// RxDB Database Initialization Script
// 데이터베이스 초기화 및 기본 데이터 생성

import { initRxDB, getRxDB } from './rxdb.js';
import { usersAPI } from './rxdb-api.js';

/**
 * 데이터베이스 초기화 및 기본 사용자 생성
 */
export async function initializeDatabase() {
  console.log('🔧 RxDB 데이터베이스 초기화 중...');

  try {
    // 1. RxDB 초기화
    const db = await initRxDB();
    console.log('✅ RxDB 초기화 완료');

    // 2. 컬렉션 확인
    console.log('📋 사용 가능한 컬렉션:', Object.keys(db));

    // 3. 기본 사용자 확인 및 생성
    const existingUsers = await db.users.find().exec();
    console.log(`👥 기존 사용자 수: ${existingUsers.length}`);

    if (existingUsers.length === 0) {
      console.log('👤 기본 사용자 생성 중...');

      const defaultUser = {
        id: 'default-technician',
        name: '기본 기술자',
        email: 'technician@photofactory.local',
        role: 'technician',
        created_at: new Date().toISOString()
      };

      await usersAPI.insert(defaultUser);
      console.log('✅ 기본 사용자 생성 완료:', defaultUser.name);
    }

    // 4. 데이터베이스 통계
    const stats = await getDatabaseStats(db);
    console.log('\n📊 데이터베이스 통계:');
    console.log(`   - 작업: ${stats.jobs}개`);
    console.log(`   - 사진: ${stats.photos}개`);
    console.log(`   - 사용자: ${stats.users}개`);
    console.log(`   - 설정: ${stats.settings}개`);

    return {
      success: true,
      message: '데이터베이스 초기화 완료',
      stats
    };
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 데이터베이스 통계 조회
 */
async function getDatabaseStats(db) {
  const jobs = await db.jobs.find().exec();
  const photos = await db.photos.find().exec();
  const users = await db.users.find().exec();
  const settings = await db.settings.find().exec();

  return {
    jobs: jobs.length,
    photos: photos.length,
    users: users.length,
    settings: settings.length
  };
}

/**
 * 데이터베이스 초기화 (모든 데이터 삭제)
 */
export async function resetDatabase() {
  console.log('⚠️  데이터베이스 초기화 (모든 데이터 삭제) 중...');

  try {
    const db = await getRxDB();

    // 모든 컬렉션 데이터 삭제
    await db.jobs.find().remove();
    await db.photos.find().remove();
    await db.settings.find().remove();

    // 사용자는 기본 사용자만 남기고 삭제
    await db.users.find({
      selector: {
        id: { $ne: 'default-technician' }
      }
    }).remove();

    console.log('✅ 데이터베이스 초기화 완료');

    return {
      success: true,
      message: '모든 데이터가 삭제되었습니다.'
    };
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 샘플 데이터 생성 (테스트용)
 */
export async function createSampleData() {
  console.log('🎨 샘플 데이터 생성 중...');

  try {
    const db = await getRxDB();

    // 샘플 작업 생성
    const sampleJob = {
      id: `job-${Date.now()}`,
      job_number: `WHL${Date.now().toString().slice(-6)}`,
      work_date: new Date().toISOString().split('T')[0],
      car_model: '2024 Tesla Model 3',
      location: '서울 강남구',
      technician_id: 'default-technician',
      status: 'uploaded',
      synced: false,
      supabase_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.jobs.insert(sampleJob);
    console.log('✅ 샘플 작업 생성:', sampleJob.job_number);

    // 샘플 사진 생성
    const categories = ['before_car', 'before_wheel', 'process', 'after_wheel', 'after_car'];
    const samplePhotos = [];

    for (let i = 0; i < categories.length; i++) {
      const photo = {
        id: `photo-${Date.now()}-${i}`,
        job_id: sampleJob.id,
        category: categories[i],
        cloudinary_url: `https://via.placeholder.com/800x600?text=${categories[i]}`,
        cloudinary_public_id: `sample-${categories[i]}`,
        thumbnail_url: `https://via.placeholder.com/300x300?text=${categories[i]}`,
        file_size: 1024000,
        sequence: i + 1,
        synced: false,
        supabase_id: null,
        created_at: new Date().toISOString()
      };

      await db.photos.insert(photo);
      samplePhotos.push(photo);
    }

    console.log(`✅ 샘플 사진 ${samplePhotos.length}장 생성`);

    return {
      success: true,
      message: '샘플 데이터 생성 완료',
      data: {
        job: sampleJob,
        photos: samplePhotos
      }
    };
  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 전역 함수로 노출 (브라우저 콘솔에서 사용 가능)
if (typeof window !== 'undefined') {
  window.initDB = initializeDatabase;
  window.resetDB = resetDatabase;
  window.createSampleData = createSampleData;
}

console.log('💡 초기화 스크립트 로드 완료');
console.log('   - initDB(): 데이터베이스 초기화');
console.log('   - resetDB(): 모든 데이터 삭제');
console.log('   - createSampleData(): 샘플 데이터 생성');
