import { motion } from 'framer-motion';
import { Video, Users, Clock, TrendingUp } from 'lucide-react';

export function KPDashboard() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'rgb(17 24 39)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-2"
          >
            <span className="bg-clip-text text-transparent" style={{
              backgroundImage: 'linear-gradient(to right, rgb(59 130 246), rgb(168 85 247))'
            }}>
              Key Player Dashboard
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-400"
          >
            Track and monitor active Key Players in real-time
          </motion.p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: Users, label: 'Active KPs', value: '0', color: 'rgb(59 130 246)' },
            { icon: Video, label: 'Cameras Tracking', value: '0', color: 'rgb(168 85 247)' },
            { icon: Clock, label: 'Hands Logged', value: '0', color: 'rgb(236 72 153)' },
            { icon: TrendingUp, label: 'Sync Status', value: 'Ready', color: 'rgb(34 197 94)' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-6 rounded-lg border"
              style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(55 65 81)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="p-12 rounded-lg border text-center"
          style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(55 65 81)' }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgb(59 130 246)20' }}
          >
            <Video className="w-8 h-8" style={{ color: 'rgb(59 130 246)' }} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">KP Tracking Coming Soon</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The Key Player tracking interface will be available here. Track active KPs, monitor camera assignments,
            and log hands in real-time with offline support and automatic synchronization.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
