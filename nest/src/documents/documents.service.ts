import { Injectable } from '@nestjs/common';
import { LOGIC_TODAY } from '../config';
import { DataService } from '../data/data.service';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class DocumentsService {
  constructor(private readonly data: DataService) {}

  getDocuments() {
    const today = new Date(`${LOGIC_TODAY}T00:00:00.000Z`);
    const warningDays = this.data.documents.thresholds.warningDays;

    return {
      today: LOGIC_TODAY,
      warningDays,
      documents: this.data.documents.documents.map((document) => {
        const expiry = new Date(`${document.expiryDate}T00:00:00.000Z`);
        const daysRemaining = Math.round(
          (expiry.getTime() - today.getTime()) / DAY_MS,
        );
        const status =
          daysRemaining <= 0
            ? 'expired'
            : daysRemaining <= warningDays
              ? 'soon'
              : 'safe';

        return { ...document, daysRemaining, status };
      }),
    };
  }
}
