// Core Models
export interface Profile {
  id: string;
  email: string;
  role: 'logger' | 'camera_supervisor' | 'producer';
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KPPlayer {
  kp_id: string;
  player_name: string;
  current_logger_id: string | null;
  claimed_at: string | null;
  table_no: number | null;
  seat_no: number | null;
  chip_count: number | null;
  last_chip_update_at: string | null;
  photo_url: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Hand {
  hand_id: string;
  hand_number: string;
  kp_id: string;
  logger_id: string;
  started_at: string;
  ended_at: string | null;
  table_no: number;
  opponents: Array<{ name: string; seat: number }>;
  result: 'win' | 'lose' | 'unknown' | null;
  notes: string | null;
  client_uuid: string | null;
  sync_status: 'pending' | 'synced' | 'error';
  created_at: string;
  updated_at: string;
}

export interface HandStreet {
  street_id: string;
  hand_id: string;
  street: 'Preflop' | 'Flop' | 'Turn' | 'River';
  street_order: number;
  pot_before: number;
  pot_after: number;
  kp_action: string | null;
  board: string[];
  created_at: string;
}
