import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Video, Zap, Clock, Wifi, CheckCircle2, MailOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {
    login,
    loginWithGoogle,
    isLoading,
    error,
    needsEmailConfirmation,
    confirmationEmail,
    clearError,
    clearConfirmation,
  } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    clearConfirmation();

    try {
      await login(email, password);
      // Only navigate if login succeeded (no email confirmation needed)
      if (!needsEmailConfirmation) {
        navigate('/');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
      // Supabase will handle the redirect
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const features = [
    { icon: Video, text: 'Track Key Player journeys in real-time', color: 'rgb(59 130 246)' },
    { icon: Zap, text: 'Process hands in 12 minutes', color: 'rgb(168 85 247)' },
    { icon: Clock, text: '±60s precision timestamp matching', color: 'rgb(236 72 153)' },
    { icon: Wifi, text: 'Work offline, sync automatically', color: 'rgb(34 197 94)' },
  ];

  // If email confirmation is needed, show confirmation message
  if (needsEmailConfirmation && confirmationEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'rgb(17 24 39)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full p-8 rounded-xl border text-center"
          style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(55 65 81)' }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgb(59 130 246)20' }}
          >
            <MailOpen className="w-10 h-10" style={{ color: 'rgb(59 130 246)' }} />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-white mb-3"
          >
            이메일 확인이 필요합니다
          </motion.h2>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-gray-300">
              <span className="font-medium text-blue-400">{confirmationEmail}</span> 주소로 확인 이메일을 보냈습니다.
            </p>
            <p className="text-sm text-gray-400">
              이메일을 확인하고 인증 링크를 클릭한 후 다시 로그인해주세요.
            </p>

            {/* Steps */}
            <div className="mt-6 p-4 rounded-lg text-left" style={{ backgroundColor: 'rgb(17 24 39)' }}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(34 197 94)' }} />
                  <p className="text-sm text-gray-300">이메일 받은편지함 확인</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(34 197 94)' }} />
                  <p className="text-sm text-gray-300">인증 링크 클릭</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(34 197 94)' }} />
                  <p className="text-sm text-gray-300">이 페이지로 돌아와서 로그인</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              이메일이 보이지 않으면 스팸 폴더를 확인해주세요.
            </p>
          </motion.div>

          {/* Back to Login Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              clearConfirmation();
              setEmail('');
              setPassword('');
            }}
            className="btn-secondary w-full py-3 mt-6"
          >
            로그인 화면으로 돌아가기
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'rgb(17 24 39)' }}>
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center py-12">
        {/* Left Side - App Description */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-8"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl font-bold mb-4"
            >
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(to right, rgb(59 130 246), rgb(168 85 247))'
              }}>
                VTC Story Ledger
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-gray-300 leading-relaxed"
            >
              Track the true protagonists of poker tournaments through Key Player journey monitoring
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 p-4 rounded-lg"
                style={{ backgroundColor: 'rgb(31 41 55)' }}
              >
                <div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="pt-4"
          >
            <p className="text-sm text-gray-400">
              Professional tool for Logger, Camera Supervisor, and Producer teams
            </p>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-400 text-sm">Access your workspace</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6 p-8 rounded-lg border" style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(55 65 81)' }}
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-md text-sm"
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  borderWidth: '1px',
                  borderColor: 'rgb(220 38 38)',
                  color: 'rgb(252 165 165)',
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Google Login Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md font-medium transition-all border"
              style={{
                backgroundColor: 'rgb(255 255 255)',
                color: 'rgb(17 24 39)',
                borderColor: 'rgb(229 231 235)',
              }}
            >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
              {isLoading ? 'Logging in...' : 'Continue with Google'}
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgb(55 65 81)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400" style={{ backgroundColor: 'rgb(31 41 55)' }}>Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="logger@vtc.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Sign In'}
              </motion.button>
            </motion.form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
