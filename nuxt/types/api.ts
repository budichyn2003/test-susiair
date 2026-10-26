export interface PilotProfile {
  name: string;
  totalFlightHours: number;
  avatarUrl: string;
}

export interface FlightHourPoint {
  date: string;
  hours: number;
  rollingSum: number;
}

export interface LimitValue {
  hours: number;
  limit: number;
}

export interface LimitSummary {
  daily: LimitValue;
  weekly: LimitValue;
  monthly: LimitValue;
  annual: LimitValue;
}

export interface FlightHoursSummary {
  range: string;
  today: string;
  limit: number;
  max: number;
  windowDays: number;
  limitSummary: LimitSummary;
  series: FlightHourPoint[];
}

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'safe' | 'soon' | 'expired';
}

export interface DocumentsResponse {
  today: string;
  warningDays: number;
  documents: PilotDocument[];
}

export interface ScheduleLegendEntry {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface SchedulesResponse {
  year: number;
  month: number;
  legend: ScheduleLegendEntry[];
  schedules: ScheduleEntry[];
}
