import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { PilotController } from './pilot.controller';
import { PilotService } from './pilot.service';

@Module({
  imports: [DataModule],
  controllers: [PilotController],
  providers: [PilotService],
})
export class PilotModule {}
