import { BadRequestException, Injectable } from '@nestjs/common';
import { LOGIC_TODAY } from '../config';
import { DataService } from '../data/data.service';
import { ChartRange, FlightHourEntry } from '../data/data.types';
import { DateRangeDto } from './dto/date-range.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class FlightHoursService {
  private readonly hoursByDate: Map<string, number>;

  constructor(private readonly data: DataService) {
    this.hoursByDate = new Map(
      data.flightHours.flightHours.map(({ date, hours }) => [date, hours]),
    );
  }

  getHours({ from, to }: DateRangeDto) {
    if (from > to) {
      throw new BadRequestException('from must be on or before to');
    }

    const start = parseDate(from).getTime();
    const end = parseDate(to).getTime();

    const flightHours: FlightHourEntry[] = [];
    for (let timestamp = start; timestamp <= end; timestamp += DAY_MS) {
      const date = formatDate(new Date(timestamp));
      flightHours.push({ date, hours: this.hoursByDate.get(date) ?? 0 });
    }

    return { from, to, flightHours };
  }

  getSummary(range: ChartRange) {
    const config = this.data.flightHours.chartBounds[range];
    const today = parseDate(LOGIC_TODAY);
    const limits = this.data.flightHours.limits;
    const limitSummary = {
      daily: {
        hours: this.sumHours(today, 1),
        limit: limits.daily,
      },
      weekly: {
        hours: this.sumHours(today, 7),
        limit: limits.weekly,
      },
      monthly: {
        hours: this.sumHours(today, 30),
        limit: limits.monthly,
      },
      annual: {
        hours: this.sumHours(today, 365),
        limit: limits.annual,
      },
    };
    const series = [];

    for (
      let offset = -config.displayRangeDays;
      offset <= config.displayRangeDays;
      offset += 1
    ) {
      const date = new Date(today.getTime() + offset * DAY_MS);
      series.push({
        date: formatDate(date),
        hours: this.hoursByDate.get(formatDate(date)) ?? 0,
        rollingSum: this.sumHours(date, config.windowDays),
      });
    }

    return {
      range,
      today: LOGIC_TODAY,
      limit: config.limit,
      max: config.max,
      windowDays: config.windowDays,
      limitSummary,
      series,
    };
  }

  private sumHours(endDate: Date, windowDays: number): number {
    let total = 0;

    for (let offset = 0; offset < windowDays; offset += 1) {
      const date = formatDate(
        new Date(endDate.getTime() - offset * DAY_MS),
      );
      total += this.hoursByDate.get(date) ?? 0;
    }

    return Math.round((total + Number.EPSILON) * 100) / 100;
  }
}
