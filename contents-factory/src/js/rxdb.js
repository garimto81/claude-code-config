// Photo Factory - RxDB Database
// Local-first database with Supabase sync

import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { jobsSchema, photosSchema, usersSchema, settingsSchema } from './rxdb-schemas.js';

/**
 * RxDB Database instance
 */
let dbInstance = null;

/**
 * Initialize RxDB Database
 * @returns {Promise<RxDatabase>}
 */
export async function initRxDB() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    console.log('📦 Initializing RxDB...');

    // Create RxDB database
    const db = await createRxDatabase({
      name: 'photofactory',
      storage: getRxStorageDexie(),
      multiInstance: true,
      eventReduce: true,
      cleanupPolicy: {
        minimumDeletedTime: 1000 * 60 * 60 * 24 * 7, // 7 days
        minimumCollectionAge: 1000 * 60 * 60 * 24, // 1 day
        runEach: 1000 * 60 * 60 * 12, // 12 hours
        awaitReplicationsInSync: true,
        waitForLeadership: true
      }
    });

    console.log('✅ RxDB database created');

    // Add collections
    await db.addCollections({
      jobs: {
        schema: jobsSchema
      },
      photos: {
        schema: photosSchema
      },
      users: {
        schema: usersSchema
      },
      settings: {
        schema: settingsSchema
      }
    });

    console.log('✅ RxDB collections added');

    // Storage statistics
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usage = (estimate.usage / 1024 / 1024).toFixed(2);
      const quota = (estimate.quota / 1024 / 1024).toFixed(2);
      console.log(`💾 Storage: ${usage}MB / ${quota}MB (${(estimate.usage / estimate.quota * 100).toFixed(1)}%)`);
    }

    dbInstance = db;
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize RxDB:', error);
    throw error;
  }
}

/**
 * Get RxDB instance
 * @returns {Promise<RxDatabase>}
 */
export async function getRxDB() {
  if (!dbInstance) {
    return await initRxDB();
  }
  return dbInstance;
}

/**
 * Close RxDB database
 */
export async function closeRxDB() {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = null;
    console.log('🔒 RxDB closed');
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData() {
  try {
    const db = await getRxDB();
    await db.jobs.remove();
    await db.photos.remove();
    await db.users.remove();
    await db.settings.remove();
    console.log('🗑️ All data cleared');
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    throw error;
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>}
 */
export async function getDatabaseStats() {
  try {
    const db = await getRxDB();

    const stats = {
      jobs: await db.jobs.count().exec(),
      photos: await db.photos.count().exec(),
      users: await db.users.count().exec(),
      settings: await db.settings.count().exec()
    };

    // Calculate storage size (approximate)
    const photos = await db.photos.find().exec();
    const totalSize = photos.reduce((sum, photo) => {
      if (photo.file_size) {
        return sum + photo.file_size;
      }
      return sum;
    }, 0);

    stats.totalStorageBytes = totalSize;
    stats.totalStorageMB = (totalSize / 1024 / 1024).toFixed(2);

    return stats;
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Export database to JSON (for backup)
 * @returns {Promise<Object>}
 */
export async function exportDatabase() {
  try {
    const db = await getRxDB();

    const data = {
      version: 1,
      timestamp: Date.now(),
      jobs: await db.jobs.find().exec(),
      photos: await db.photos.find().exec(),
      users: await db.users.find().exec(),
      settings: await db.settings.find().exec()
    };

    console.log('📤 Database exported:', {
      jobs: data.jobs.length,
      photos: data.photos.length,
      users: data.users.length
    });

    return data;
  } catch (error) {
    console.error('❌ Failed to export database:', error);
    throw error;
  }
}

/**
 * Import database from JSON (for restore)
 * @param {Object} data - Exported data
 */
export async function importDatabase(data) {
  try {
    if (data.version !== 1) {
      throw new Error(`Unsupported database version: ${data.version}`);
    }

    const db = await getRxDB();

    // Clear existing data
    await clearAllData();

    // Import data
    if (data.jobs && data.jobs.length > 0) {
      await db.jobs.bulkInsert(data.jobs);
    }
    if (data.photos && data.photos.length > 0) {
      await db.photos.bulkInsert(data.photos);
    }
    if (data.users && data.users.length > 0) {
      await db.users.bulkInsert(data.users);
    }
    if (data.settings && data.settings.length > 0) {
      await db.settings.bulkInsert(data.settings);
    }

    console.log('📥 Database imported:', {
      jobs: data.jobs?.length || 0,
      photos: data.photos?.length || 0,
      users: data.users?.length || 0
    });
  } catch (error) {
    console.error('❌ Failed to import database:', error);
    throw error;
  }
}

// Auto-initialize when module loads
initRxDB().catch(error => {
  console.error('Failed to auto-initialize RxDB:', error);
});

console.log('📦 RxDB module loaded');
