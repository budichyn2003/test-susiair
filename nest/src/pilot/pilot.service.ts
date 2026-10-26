import { Injectable } from '@nestjs/common';
import { getPilotAvatarUrl } from '../config';
import { DataService } from '../data/data.service';

@Injectable()
export class PilotService {
  constructor(private readonly data: DataService) {}

  getProfile() {
    return {
      ...this.data.flightHours.pilot,
      avatarUrl: getPilotAvatarUrl(),
    };
  }
}
