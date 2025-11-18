// Photo Factory - RxDB API Layer
// Provides db-api.js compatible interface using RxDB

import { getRxDB } from './rxdb.js';
import { syncWithSupabase } from './rxdb-sync.js';

/**
 * Generate unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Jobs API (RxDB)
 */
export const jobsAPI = {
  /**
   * Insert new job
   * @param {Object} jobData
   * @returns {Promise<{data: Object, error: null}>}
   */
  async insert(jobData) {
    try {
      const db = await getRxDB();

      const job = await db.jobs.insert({
        id: generateId(),
        ...jobData,
        created_at: jobData.created_at || Date.now(),
        updated_at: Date.now(),
        synced: false,
        supabase_id: null
      });

      // Trigger sync in background (don't wait)
      triggerSync();

      return {
        data: job.toJSON(),
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to insert job:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Select jobs with filters
   * @param {string} columns - Columns to select (ignored, returns all)
   * @returns {Object} - Query builder
   */
  select(columns = '*') {
    return {
      /**
       * Filter by technician_id
       */
      eq: (field, value) => ({
        order: (orderField, options = {}) => ({
          then: async (callback) => {
            try {
              const db = await getRxDB();

              // Query with filter
              let query = db.jobs.find({
                selector: {
                  [field]: value
                }
              });

              // Apply sorting
              if (options.ascending === false) {
                query = query.sort({ [orderField]: 'desc' });
              } else {
                query = query.sort({ [orderField]: 'asc' });
              }

              const jobs = await query.exec();

              // Get photos for each job
              const jobsWithPhotos = await Promise.all(
                jobs.map(async (job) => {
                  const photos = await db.photos
                    .find({
                      selector: {
                        job_id: job.id
                      }
                    })
                    .sort({ sequence: 'asc' })
                    .exec();

                  return {
                    ...job.toJSON(),
                    photos: photos.map(p => p.toJSON())
                  };
                })
              );

              return callback({ data: jobsWithPhotos, error: null });
            } catch (error) {
              console.error('❌ Failed to select jobs:', error);
              return callback({ data: null, error: error.message });
            }
          }
        })
      })
    };
  },

  /**
   * Update job
   * @param {string} id
   * @param {Object} updates
   */
  async update(id, updates) {
    try {
      const db = await getRxDB();

      const job = await db.jobs.findOne({
        selector: { id }
      }).exec();

      if (!job) {
        throw new Error('Job not found');
      }

      await job.update({
        $set: {
          ...updates,
          updated_at: Date.now(),
          synced: false
        }
      });

      // Trigger sync in background
      triggerSync();

      return {
        data: job.toJSON(),
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to update job:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Delete job
   * @param {string} id
   */
  async delete(id) {
    try {
      const db = await getRxDB();

      // Delete related photos first
      await db.photos.find({
        selector: { job_id: id }
      }).remove();

      // Delete job
      const job = await db.jobs.findOne({
        selector: { id }
      }).exec();

      if (job) {
        await job.remove();
      }

      return {
        data: { id },
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to delete job:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};

/**
 * Photos API (RxDB)
 */
export const photosAPI = {
  /**
   * Insert photos (batch)
   * @param {Array} photosData
   */
  async insert(photosData) {
    try {
      const db = await getRxDB();

      // Handle single object or array
      const dataArray = Array.isArray(photosData) ? photosData : [photosData];

      const photos = await Promise.all(
        dataArray.map(photo =>
          db.photos.insert({
            id: generateId(),
            ...photo,
            uploaded_at: photo.uploaded_at || Date.now(),
            synced: false,
            supabase_id: null
          })
        )
      );

      // Trigger sync in background
      triggerSync();

      return {
        data: photos.map(p => p.toJSON()),
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to insert photos:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Select photos by job_id
   * @param {string} jobId
   */
  async selectByJob(jobId) {
    try {
      const db = await getRxDB();

      const photos = await db.photos
        .find({
          selector: { job_id: jobId }
        })
        .sort({ sequence: 'asc' })
        .exec();

      return {
        data: photos.map(p => p.toJSON()),
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to select photos:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Delete photo
   * @param {string} id
   */
  async delete(id) {
    try {
      const db = await getRxDB();

      const photo = await db.photos.findOne({
        selector: { id }
      }).exec();

      if (photo) {
        await photo.remove();
      }

      return {
        data: { id },
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to delete photo:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};

/**
 * Users API (RxDB)
 */
export const usersAPI = {
  /**
   * Create local user
   * @param {Object} userData
   */
  async create(userData) {
    try {
      const db = await getRxDB();

      const user = await db.users.insert({
        id: generateId(),
        ...userData,
        created_at: Date.now(),
        synced: false,
        supabase_id: null
      });

      return {
        data: user.toJSON(),
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Get user by email
   * @param {string} email
   */
  async getByEmail(email) {
    try {
      const db = await getRxDB();

      const user = await db.users.findOne({
        selector: { email }
      }).exec();

      return {
        data: user ? user.toJSON() : null,
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to get user:', error);
      return {
        data: null,
        error: error.message
      };
    }
  },

  /**
   * Get all users
   */
  async getAll() {
    try {
      const db = await getRxDB();

      const users = await db.users.find().exec();

      return {
        data: users.map(u => u.toJSON()),
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to get users:', error);
      return {
        data: null,
        error: error.message
      };
    }
  }
};

/**
 * Generate job number (RxDB version)
 */
export async function generateJobNumber() {
  try {
    const db = await getRxDB();
    const today = new Date();
    const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, '');

    // Count jobs created today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const todayJobs = await db.jobs
      .find({
        selector: {
          created_at: {
            $gte: todayStart,
            $lt: todayEnd
          }
        }
      })
      .exec();

    const sequence = (todayJobs.length + 1).toString().padStart(3, '0');
    const jobNumber = `WHL${yymmdd}${sequence}`;

    return {
      data: jobNumber,
      error: null
    };
  } catch (error) {
    console.error('❌ Failed to generate job number:', error);
    return {
      data: `WHL${Date.now().toString().slice(-9)}`,
      error: error.message
    };
  }
}

/**
 * Helper: Convert File to Base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Helper: Generate thumbnail from image
 * @param {File} file
 * @param {number} maxSize
 * @returns {Promise<string>}
 */
export async function generateThumbnail(file, maxSize = 300) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
}

/**
 * Trigger background sync (debounced)
 */
let syncTimeout = null;
async function triggerSync() {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      const { getCurrentUser } = await import('./auth-local.js');
      const user = await getCurrentUser();

      if (user && navigator.onLine) {
        await syncWithSupabase(user.id);
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, 2000); // 2초 후 동기화
}

console.log('📡 RxDB API layer loaded');
