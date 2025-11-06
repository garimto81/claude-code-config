// Photo Factory - Configuration
// API Keys and Environment Variables

// Supabase Configuration
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your_anon_public_key_here';

// Imgur API Configuration
export const IMGUR_CLIENT_ID = 'your_imgur_client_id_here';

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

  if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
    errors.push('Supabase URL이 설정되지 않았습니다. config.js를 확인하세요.');
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your_anon')) {
    errors.push('Supabase ANON KEY가 설정되지 않았습니다.');
  }

  if (!IMGUR_CLIENT_ID || IMGUR_CLIENT_ID.includes('your_imgur')) {
    errors.push('Imgur Client ID가 설정되지 않았습니다.');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration Errors:', errors);
    alert('설정 오류:\n\n' + errors.join('\n'));
    return false;
  }

  console.log('✅ Configuration validated successfully');
  return true;
}
