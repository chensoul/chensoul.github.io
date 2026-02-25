/**
 * Running 页面数据类型
 */

export interface RunListItem {
  date: string;
  distance: number;
  duration: string;
  pace: string;
  hr_zone?: number;
  activity_type?: string;
  workout_name?: string;
  route?: string;
  vdot?: number;
  training_load?: number;
  [key: string]: unknown;
}

export interface RunDetail extends RunListItem {
  total_duration?: string;
  heart_rate?: number;
  max_heart_rate?: number;
  cadence?: number;
  stride_length?: number;
  calories?: number;
  elevation_gain?: number;
  avg_power?: number;
  max_power?: number;
  segments?: Array<{
    km?: number;
    pace?: string;
    gap?: string;
    heart_rate?: number;
    hr_zone?: number;
    cadence?: number;
    avg_cadence?: number;
  }>;
  laps?: Array<{
    distance?: number;
    pace?: string;
    cadence?: number;
    power?: number;
    heart_rate?: number;
    hr_zone?: number;
  }>;
}
