import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DocumentsData,
  FlightHoursData,
  SchedulesData,
} from './data.types';

@Injectable()
export class DataService {
  readonly flightHours: FlightHoursData;
  readonly documents: DocumentsData;
  readonly schedules: SchedulesData;

  constructor() {
    const dataDirectory = process.env.DATA_DIR ?? join(process.cwd(), 'data');
    this.flightHours = this.loadJson<FlightHoursData>(
      dataDirectory,
      'mock-flight-hours.json',
    );
    this.documents = this.loadJson<DocumentsData>(
      dataDirectory,
      'mock-documents.json',
    );
    this.schedules = this.loadJson<SchedulesData>(
      dataDirectory,
      'mock-schedules.json',
    );
  }

  private loadJson<T>(directory: string, filename: string): T {
    const filePath = join(directory, filename);

    try {
      return JSON.parse(readFileSync(filePath, 'utf8')) as T;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load seed data at ${filePath}: ${detail}`, {
        cause: error,
      });
    }
  }
}
