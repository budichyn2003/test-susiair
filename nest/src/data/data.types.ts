export type ChartRange = '1w' | '1m' | '3m' | '6m' | '1y';

export interface PilotData {
  name: string;
  totalFlightHours: number;
}

export interface FlightHourEntry {
  date: string;
  hours: number;
}

export interface FlightHoursData {
  pilot: PilotData;
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
    annual: number;
  };
  chartBounds: Record<
    ChartRange,
    {
      limit: number;
      max: number;
      windowDays: number;
      displayRangeDays: number;
    }
  >;
  flightHours: FlightHourEntry[];
}

export interface DocumentEntry {
  id: string;
  label: string;
  expiryDate: string;
}

export interface DocumentsData {
  today: string;
  thresholds: {
    warningDays: number;
    comment: string;
  };
  documents: DocumentEntry[];
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

export interface SchedulesData {
  today: string;
  fieldGuide: Record<string, string>;
  legend: ScheduleLegendEntry[];
  schedules: ScheduleEntry[];
}
