// Photo Factory - RxDB Supabase Sync
// Bidirectional sync between RxDB (local) and Supabase (cloud)

import { getRxDB } from './rxdb.js';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

/**
 * Supabase client for sync
 */
let supabase = null;

/**
 * Sync status
 */
let syncStatus = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingChanges: 0,
  errors: []
};

/**
 * Initialize Supabase client
 */
function getSupabase() {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

/**
 * Generate unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sync jobs to Supabase
 * @returns {Promise<Object>}
 */
async function pushJobs() {
  const db = await getRxDB();
  const supabase = getSupabase();

  // Find unsynced jobs
  const unsyncedJobs = await db.jobs
    .find({
      selector: {
        synced: false
      }
    })
    .exec();

  console.log(`📤 Pushing ${unsyncedJobs.length} jobs to Supabase...`);

  let pushed = 0;
  let errors = 0;

  for (const job of unsyncedJobs) {
    try {
      const jobData = job.toJSON();

      // Check if job already exists in Supabase
      if (jobData.supabase_id) {
        // Update existing
        const { error } = await supabase
          .from('jobs')
          .update({
            job_number: jobData.job_number,
            work_date: jobData.work_date,
            car_model: jobData.car_model,
            location: jobData.location,
            technician_id: jobData.technician_id,
            status: jobData.status,
            updated_at: new Date(jobData.updated_at).toISOString()
          })
          .eq('id', jobData.supabase_id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            job_number: jobData.job_number,
            work_date: jobData.work_date,
            car_model: jobData.car_model,
            location: jobData.location,
            technician_id: jobData.technician_id,
            status: jobData.status,
            created_at: new Date(jobData.created_at).toISOString(),
            updated_at: new Date(jobData.updated_at).toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Update local job with Supabase ID
        await job.update({
          $set: {
            supabase_id: data.id
          }
        });
      }

      // Mark as synced
      await job.update({
        $set: {
          synced: true
        }
      });

      pushed++;
    } catch (error) {
      console.error(`❌ Failed to push job ${jobData.id}:`, error);
      errors++;
    }
  }

  return { pushed, errors };
}

/**
 * Sync photos to Supabase
 * @returns {Promise<Object>}
 */
async function pushPhotos() {
  const db = await getRxDB();
  const supabase = getSupabase();

  // Find unsynced photos
  const unsyncedPhotos = await db.photos
    .find({
      selector: {
        synced: false
      }
    })
    .exec();

  console.log(`📤 Pushing ${unsyncedPhotos.length} photos to Supabase...`);

  let pushed = 0;
  let errors = 0;

  for (const photo of unsyncedPhotos) {
    try {
      const photoData = photo.toJSON();

      // Get job's Supabase ID
      const job = await db.jobs.findOne({
        selector: {
          id: photoData.job_id
        }
      }).exec();

      if (!job || !job.supabase_id) {
        console.warn(`⚠️ Skipping photo ${photoData.id}: job not synced yet`);
        continue;
      }

      if (photoData.supabase_id) {
        // Update existing
        const { error } = await supabase
          .from('photos')
          .update({
            job_id: job.supabase_id,
            category: photoData.category,
            cloudinary_url: photoData.cloudinary_url,
            cloudinary_public_id: photoData.cloudinary_public_id,
            thumbnail_url: photoData.thumbnail_url,
            file_size: photoData.file_size,
            sequence: photoData.sequence,
            uploaded_at: new Date(photoData.uploaded_at).toISOString()
          })
          .eq('id', photoData.supabase_id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('photos')
          .insert({
            job_id: job.supabase_id,
            category: photoData.category,
            cloudinary_url: photoData.cloudinary_url,
            cloudinary_public_id: photoData.cloudinary_public_id,
            thumbnail_url: photoData.thumbnail_url,
            file_size: photoData.file_size,
            sequence: photoData.sequence,
            uploaded_at: new Date(photoData.uploaded_at).toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Update local photo with Supabase ID
        await photo.update({
          $set: {
            supabase_id: data.id
          }
        });
      }

      // Mark as synced
      await photo.update({
        $set: {
          synced: true
        }
      });

      pushed++;
    } catch (error) {
      console.error(`❌ Failed to push photo ${photoData.id}:`, error);
      errors++;
    }
  }

  return { pushed, errors };
}

/**
 * Pull jobs from Supabase
 * @param {string} userId - User ID to filter
 * @returns {Promise<Object>}
 */
async function pullJobs(userId) {
  const db = await getRxDB();
  const supabase = getSupabase();

  console.log('📥 Pulling jobs from Supabase...');

  const { data: remoteJobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('technician_id', userId);

  if (error) {
    console.error('❌ Failed to pull jobs:', error);
    return { pulled: 0, errors: 1 };
  }

  let pulled = 0;
  let errors = 0;

  for (const remoteJob of remoteJobs) {
    try {
      // Check if job exists locally
      const localJob = await db.jobs.findOne({
        selector: {
          supabase_id: remoteJob.id
        }
      }).exec();

      const jobData = {
        id: localJob?.id || generateId(),
        job_number: remoteJob.job_number,
        work_date: remoteJob.work_date,
        car_model: remoteJob.car_model,
        location: remoteJob.location || '',
        technician_id: remoteJob.technician_id,
        status: remoteJob.status,
        created_at: new Date(remoteJob.created_at).getTime(),
        updated_at: new Date(remoteJob.updated_at).getTime(),
        synced: true,
        supabase_id: remoteJob.id
      };

      if (localJob) {
        // Update if remote is newer
        if (jobData.updated_at > localJob.updated_at) {
          await localJob.update({
            $set: jobData
          });
          pulled++;
        }
      } else {
        // Insert new
        await db.jobs.insert(jobData);
        pulled++;
      }
    } catch (error) {
      console.error(`❌ Failed to pull job ${remoteJob.id}:`, error);
      errors++;
    }
  }

  return { pulled, errors };
}

/**
 * Pull photos from Supabase
 * @returns {Promise<Object>}
 */
async function pullPhotos() {
  const db = await getRxDB();
  const supabase = getSupabase();

  console.log('📥 Pulling photos from Supabase...');

  // Get all synced jobs with Supabase IDs
  const syncedJobs = await db.jobs.find({
    selector: {
      supabase_id: { $exists: true, $ne: null }
    }
  }).exec();

  const supabaseJobIds = syncedJobs.map(job => job.supabase_id);

  if (supabaseJobIds.length === 0) {
    return { pulled: 0, errors: 0 };
  }

  const { data: remotePhotos, error } = await supabase
    .from('photos')
    .select('*')
    .in('job_id', supabaseJobIds);

  if (error) {
    console.error('❌ Failed to pull photos:', error);
    return { pulled: 0, errors: 1 };
  }

  let pulled = 0;
  let errors = 0;

  for (const remotePhoto of remotePhotos) {
    try {
      // Find local job
      const localJob = syncedJobs.find(job => job.supabase_id === remotePhoto.job_id);
      if (!localJob) continue;

      // Check if photo exists locally
      const localPhoto = await db.photos.findOne({
        selector: {
          supabase_id: remotePhoto.id
        }
      }).exec();

      const photoData = {
        id: localPhoto?.id || generateId(),
        job_id: localJob.id,
        category: remotePhoto.category,
        cloudinary_url: remotePhoto.cloudinary_url,
        cloudinary_public_id: remotePhoto.cloudinary_public_id,
        thumbnail_url: remotePhoto.thumbnail_url,
        file_size: remotePhoto.file_size,
        sequence: remotePhoto.sequence,
        uploaded_at: new Date(remotePhoto.uploaded_at).getTime(),
        synced: true,
        supabase_id: remotePhoto.id
      };

      if (localPhoto) {
        // Update (photos rarely change, but handle it)
        await localPhoto.update({
          $set: photoData
        });
        pulled++;
      } else {
        // Insert new
        await db.photos.insert(photoData);
        pulled++;
      }
    } catch (error) {
      console.error(`❌ Failed to pull photo ${remotePhoto.id}:`, error);
      errors++;
    }
  }

  return { pulled, errors };
}

/**
 * Full sync: Push local changes, then pull remote changes
 * @param {string} userId - Current user ID
 * @returns {Promise<Object>}
 */
export async function syncWithSupabase(userId) {
  if (!navigator.onLine) {
    console.warn('⚠️ Offline: skipping sync');
    return {
      success: false,
      message: 'Offline'
    };
  }

  if (syncStatus.isSyncing) {
    console.warn('⚠️ Sync already in progress');
    return {
      success: false,
      message: 'Sync in progress'
    };
  }

  syncStatus.isSyncing = true;

  try {
    console.log('🔄 Starting full sync...');

    // Push local changes first
    const pushJobsResult = await pushJobs();
    const pushPhotosResult = await pushPhotos();

    // Pull remote changes
    const pullJobsResult = await pullJobs(userId);
    const pullPhotosResult = await pullPhotos();

    syncStatus.lastSyncTime = Date.now();
    syncStatus.isSyncing = false;

    const result = {
      success: true,
      push: {
        jobs: pushJobsResult,
        photos: pushPhotosResult
      },
      pull: {
        jobs: pullJobsResult,
        photos: pullPhotosResult
      },
      timestamp: syncStatus.lastSyncTime
    };

    console.log('✅ Sync completed:', result);

    return result;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    syncStatus.isSyncing = false;
    syncStatus.errors.push({
      time: Date.now(),
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get sync status
 * @returns {Object}
 */
export function getSyncStatus() {
  return { ...syncStatus };
}

/**
 * Auto-sync on network change
 */
window.addEventListener('online', async () => {
  console.log('📡 Network online: starting sync...');
  syncStatus.isOnline = true;

  // Get current user (you'll need to implement this)
  const user = await getCurrentUser();
  if (user) {
    await syncWithSupabase(user.id);
  }
});

window.addEventListener('offline', () => {
  console.log('📴 Network offline');
  syncStatus.isOnline = false;
});

// Helper to get current user (placeholder)
async function getCurrentUser() {
  try {
    const { getCurrentUser: getUser } = await import('./auth-local.js');
    return await getUser();
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

console.log('🔄 RxDB Sync module loaded');
