import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Injectable()
export class SchedulesService {
  constructor(private readonly data: DataService) {}

  getMonth(year: number, month: number) {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    return {
      year,
      month,
      legend: this.data.schedules.legend,
      schedules: this.data.schedules.schedules.filter((schedule) =>
        schedule.duty_date.startsWith(monthPrefix),
      ),
    };
  }
}
