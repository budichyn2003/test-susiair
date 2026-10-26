import { IsIn } from 'class-validator';
import { ChartRange } from '../../data/data.types';

const CHART_RANGES: ChartRange[] = ['1w', '1m', '3m', '6m', '1y'];

export class SummaryQueryDto {
  @IsIn(CHART_RANGES)
  range!: ChartRange;
}
