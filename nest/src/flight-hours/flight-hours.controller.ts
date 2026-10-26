import { Controller, Get, Query } from '@nestjs/common';
import { DateRangeDto } from './dto/date-range.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { FlightHoursService } from './flight-hours.service';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get()
  getHours(@Query() query: DateRangeDto) {
    return this.flightHoursService.getHours(query);
  }

  @Get('summary')
  getSummary(@Query() query: SummaryQueryDto) {
    return this.flightHoursService.getSummary(query.range);
  }
}
