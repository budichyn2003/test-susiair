import { Controller, Get, Query } from '@nestjs/common';
import { MonthQueryDto } from './dto/month-query.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getMonth(@Query() query: MonthQueryDto) {
    return this.schedulesService.getMonth(query.year, query.month);
  }
}
