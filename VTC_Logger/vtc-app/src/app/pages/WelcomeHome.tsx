import { motion } from 'framer-motion';
import { Video, Zap, Users, TrendingUp, Database, Shield } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

export function WelcomeHome() {
  const { user } = useAuthStore();

  const features = [
    {
      icon: Video,
      title: 'Key Player Tracking',
      description: 'Track every move of key players in real-time during tournaments',
      color: 'rgb(59 130 246)',
    },
    {
      icon: Zap,
      title: '12-Minute Processing',
      description: 'Reduce hand processing time from hours to just 12 minutes',
      color: 'rgb(168 85 247)',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: '10 concurrent loggers with real-time synchronization',
      color: 'rgb(34 197 94)',
    },
    {
      icon: Database,
      title: 'Offline-First',
      description: 'Work seamlessly even without internet connection',
      color: 'rgb(251 146 60)',
    },
    {
      icon: TrendingUp,
      title: 'Smart Matching',
      description: '±60s timestamp auto-matching with video files',
      color: 'rgb(236 72 153)',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with Supabase',
      color: 'rgb(14 165 233)',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(17 24 39)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          {/* Welcome Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(34 197 94)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgb(147 197 253)' }}>
                Welcome, {user?.display_name}!
              </span>
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            <span className="block">VTC Story Ledger</span>
            <span
              className="block mt-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(168 85 247) 100%)',
              }}
            >
              Track the Journey
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            The ultimate tool for tracking Key Player journeys during poker tournaments.
            Deliver the <span style={{ color: 'rgb(168 85 247)', fontWeight: '600' }}>main scenario</span> to viewers
            with <span style={{ color: 'rgb(59 130 246)', fontWeight: '600' }}>precision</span> and <span style={{ color: 'rgb(34 197 94)', fontWeight: '600' }}>speed</span>.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
          >
            {[
              { value: '12min', label: 'Processing Time' },
              { value: '±60s', label: 'Timestamp Match' },
              { value: '10+', label: 'Concurrent Users' },
              { value: '24/7', label: 'Offline Ready' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="text-center p-6 rounded-lg" style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', border: '1px solid rgb(55 65 81)' }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: 'rgb(59 130 246)' }}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need for efficient Key Player tracking
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-6 rounded-lg border cursor-pointer"
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderColor: 'rgb(55 65 81)',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${feature.color}20`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center"
      >
        <div
          className="p-12 rounded-2xl border"
          style={{
            backgroundColor: 'rgba(31, 41, 55, 0.5)',
            borderColor: 'rgb(55 65 81)',
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Your role: <span className="font-semibold" style={{ color: 'rgb(168 85 247)' }}>{user?.role}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg font-semibold text-white text-lg"
              style={{
                background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%)',
              }}
            >
              View KP Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg font-semibold border text-white text-lg"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgb(55 65 81)',
              }}
            >
              Read Documentation
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 border-t" style={{ borderColor: 'rgb(55 65 81)' }}>
        <div className="text-center text-gray-500 text-sm">
          <p>VTC Story Ledger © 2025 | Built with React, Supabase, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
