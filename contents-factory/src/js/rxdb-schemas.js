// Photo Factory - RxDB Schemas
// RxDB schema definitions for all collections

/**
 * Jobs Schema
 */
export const jobsSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    job_number: {
      type: 'string',
      maxLength: 50
    },
    work_date: {
      type: 'string',
      format: 'date'
    },
    car_model: {
      type: 'string',
      maxLength: 100
    },
    location: {
      type: 'string',
      maxLength: 200
    },
    technician_id: {
      type: 'string',
      maxLength: 100
    },
    status: {
      type: 'string',
      enum: ['uploaded', 'processing', 'published'],
      maxLength: 20
    },
    created_at: {
      type: 'number'
    },
    updated_at: {
      type: 'number'
    },
    synced: {
      type: 'boolean',
      default: false
    },
    supabase_id: {
      type: ['string', 'null'],
      maxLength: 100
    }
  },
  required: ['id', 'job_number', 'car_model', 'technician_id', 'status'],
  indexes: ['job_number', 'technician_id', 'created_at', 'synced']
};

/**
 * Photos Schema
 */
export const photosSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    job_id: {
      type: 'string',
      ref: 'jobs',
      maxLength: 100
    },
    category: {
      type: 'string',
      enum: ['before_car', 'before_wheel', 'during', 'after_wheel', 'after_car'],
      maxLength: 20
    },
    cloudinary_url: {
      type: 'string',
      maxLength: 500
    },
    cloudinary_public_id: {
      type: 'string',
      maxLength: 200
    },
    thumbnail_url: {
      type: 'string',
      maxLength: 500
    },
    file_size: {
      type: 'number'
    },
    sequence: {
      type: 'number'
    },
    uploaded_at: {
      type: 'number'
    },
    synced: {
      type: 'boolean',
      default: false
    },
    supabase_id: {
      type: ['string', 'null'],
      maxLength: 100
    }
  },
  required: ['id', 'job_id', 'category', 'sequence'],
  indexes: ['job_id', 'category', 'synced']
};

/**
 * Users Schema
 */
export const usersSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    email: {
      type: 'string',
      format: 'email',
      maxLength: 200
    },
    password_hash: {
      type: 'string',
      maxLength: 200
    },
    display_name: {
      type: 'string',
      maxLength: 100
    },
    avatar_url: {
      type: 'string',
      maxLength: 500
    },
    created_at: {
      type: 'number'
    },
    synced: {
      type: 'boolean',
      default: false
    },
    supabase_id: {
      type: ['string', 'null'],
      maxLength: 100
    }
  },
  required: ['id', 'email'],
  indexes: ['email', 'synced']
};

/**
 * Settings Schema
 */
export const settingsSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    key: {
      type: 'string',
      maxLength: 100
    },
    value: {
      type: 'string'
    },
    updated_at: {
      type: 'number'
    }
  },
  required: ['id', 'key'],
  indexes: ['key']
};

console.log('📋 RxDB schemas loaded');
