import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { DataModule } from './data/data.module';
import { DocumentsModule } from './documents/documents.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { HttpExceptionFilter } from './http-exception.filter';
import { PilotModule } from './pilot/pilot.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
