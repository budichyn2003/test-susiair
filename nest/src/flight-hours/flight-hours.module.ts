import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { FlightHoursController } from './flight-hours.controller';
import { FlightHoursService } from './flight-hours.service';

@Module({
  imports: [DataModule],
  controllers: [FlightHoursController],
  providers: [FlightHoursService],
})
export class FlightHoursModule {}
