const Event = require('../event');
const moment = require('moment/moment');

describe('Testing Events Entity Logic', () => {
  //reset eventlist before each tests
  afterEach(() => {
    Event.resetEventList();
  });

  test('Add opening and recurring event -> should work', () => {
    var startDate = moment('2006-07-01 10:30');
    var endDate = moment('2006-07-01 14:00');
    new Event.Event(true, true, startDate, endDate);
    expect(Event.eventList.length).toBe(1);
  });

  test('Add busy event -> should work', () => {
    var startDate = moment('2006-07-08 11:30');
    var endDate = moment('2006-07-08 12:30');
    new Event.Event(false, false, startDate, endDate);
    expect(Event.eventList.length).toBe(1);
  });

  test('Add event with inverted dates -> should fail !', () => {
    var startDate = moment('2006-07-08 11:30');
    var endDate = moment('2006-07-08 12:30');
    const result = new Event.Event(false, false, endDate, startDate);
    expect(result.error).toBe(true);
  });
});

describe('Testing Events Entity Context', () => {
  let mainEvent;
  let fromDate;
  let toDate;
  //prepare the context
  beforeAll(() => {
    //add recurring opening events
    var startDate = moment('2006-07-01 10:30');
    var endDate = moment('2006-07-01 14:00');
    new Event.Event(true, true, startDate, endDate);
    var startDate = moment('2006-07-02 08:00');
    var endDate = moment('2006-07-02 18:00');
    new Event.Event(true, true, startDate, endDate);

    //add busy events
    var startDate = moment('2006-07-08 11:30');
    var endDate = moment('2006-07-08 12:30');
    new Event.Event(false, false, startDate, endDate);
    var startDate = moment('2006-07-09 10:30');
    var endDate = moment('2006-07-09 16:00');
    new Event.Event(false, false, startDate, endDate);
    var startDate = moment('2006-07-15 10:00');
    var endDate = moment('2006-07-15 13:00');
    mainEvent = new Event.Event(false, false, startDate, endDate);

    fromDate = moment('2006-07-04 10:00');
    toDate = moment('2006-07-10 10:00');
  });

  test('GetOpeningsBetweenDates -> should return 4 availabilities', () => {
    const result = mainEvent.getOpeningsBetweenDates(fromDate, toDate);
    expect(result.length).toBe(4);
  });

  test('GetBusyEventsBetweenDates -> should return 2 busy events', () => {
    const result = mainEvent.getBusyEventsBetweenDates(fromDate, toDate);
    expect(result.length).toBe(2);
  });

  test('Split in 30 minutes opening events -> should return 40 opening events', () => {
    const result = mainEvent.splitInMinutes(
      mainEvent.getOpeningsBetweenDates(fromDate, toDate)
    );
    expect(result.length).toBe(40);
  });

  test('Split in 30 minutes busy events -> should return 13 busy events', () => {
    const result = mainEvent.splitInMinutes(
      mainEvent.getBusyEventsBetweenDates(fromDate, toDate)
    );
    expect(result.length).toBe(13);
  });

  test('GetAvailabilitiesDates for client -> should return 14 availabilities', () => {
    const openings = mainEvent.splitInMinutes(
      mainEvent.getOpeningsBetweenDates(fromDate, toDate)
    );
    const busy = mainEvent.splitInMinutes(
      mainEvent.getBusyEventsBetweenDates(fromDate, toDate)
    );
    const result = mainEvent.getAvailabilitiesDates(openings, busy);
    expect(result.length).toBe(14);
  });

  test('GetAvailabilitiesDates for client -> should return specific text', () => {
    fromDate = moment('2006-07-05 10:00');
    toDate = moment('2006-07-15 16:00');
    const result = mainEvent.availabilities(fromDate, toDate);
    expect(result).toBe(
      "I'm available from \nJuly 8th at 10:30 , 11:00 , 12:30 , 13:00 , 13:30 \nJuly 9th at 08:00 , 08:30 , 09:00 , 09:30 , 10:00 , 16:00 , 16:30 , 17:00 , 17:30 \nJuly 15th at 13:00 , 13:30 ."
    );
  });
});
