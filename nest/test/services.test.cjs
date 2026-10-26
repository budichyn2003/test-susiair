const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { AuthService } = require('../dist/auth/auth.service');
const { DataService } = require('../dist/data/data.service');
const { DocumentsService } = require('../dist/documents/documents.service');
const { FlightHoursService } = require('../dist/flight-hours/flight-hours.service');
const { SchedulesService } = require('../dist/schedules/schedules.service');

const data = new DataService();

describe('pilot API services', () => {
  it('issues a bearer token for the test account and rejects bad credentials', () => {
    const auth = new AuthService();
    const session = auth.login({ username: 'johndoe', password: 'susiairtest' });

    assert.equal(session.tokenType, 'Bearer');
    assert.equal(auth.isValidToken(session.accessToken), true);
    assert.throws(
      () => auth.login({ username: 'johndoe', password: 'wrong' }),
      { status: 401 },
    );
  });

  it('returns inclusive date ranges and zero for dates without seed entries', () => {
    const service = new FlightHoursService(data);
    const response = service.getHours({
      from: '2026-06-01',
      to: '2026-06-02',
    });

    assert.deepEqual(response.flightHours, [
      { date: '2026-06-01', hours: 0 },
      { date: '2026-06-02', hours: 0 },
    ]);
    assert.throws(
      () =>
        service.getHours({
          from: '2026-06-02',
          to: '2026-06-01',
        }),
      { status: 400 },
    );
  });

  it('calculates centered chart points and limit cards on the server', () => {
    const summary = new FlightHoursService(data).getSummary('1w');
    const aboveLimit = summary.series.find((point) => point.date === '2026-05-18');

    assert.equal(summary.today, '2026-05-15');
    assert.equal(summary.series.length, 15);
    assert.equal(summary.limitSummary.daily.hours, 6.4);
    assert.equal(summary.limitSummary.weekly.hours, 25.2);
    assert.equal(aboveLimit.rollingSum, 42.8);
    assert.ok(aboveLimit.rollingSum > summary.limit);
  });

  it('calculates document urgency against the fixed test date', () => {
    const response = new DocumentsService(data).getDocuments();
    const documents = Object.fromEntries(
      response.documents.map((document) => [document.id, document]),
    );

    assert.equal(response.today, '2026-05-15');
    assert.equal(documents.doc_license.daysRemaining, 14);
    assert.equal(documents.doc_license.status, 'soon');
    assert.equal(documents.doc_security.status, 'expired');
  });

  it('returns month schedules and the JSON legend together', () => {
    const response = new SchedulesService(data).getMonth(2026, 6);

    assert.equal(response.year, 2026);
    assert.equal(response.month, 6);
    assert.equal(response.schedules.length, 16);
    assert.equal(response.legend.length, 10);
    assert.ok(response.schedules.every((item) => item.duty_date.startsWith('2026-06-')));
  });
});
