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
    var startDate = moment('2006-07-01 16:00');
    var endDate = moment('2006-07-01 18:00');
    new Event.Event(true, false, startDate, endDate);

    //add busy events
    var startDate = moment('2006-07-08 11:30');
    var endDate = moment('2006-07-08 12:30');
    new Event.Event(false, false, startDate, endDate);
    var startDate = moment('2006-07-09 10:30');
    var endDate = moment('2006-07-09 16:00');
    new Event.Event(false, false, startDate, endDate);
    var startDate = moment('2006-07-15 10:00');
    var endDate = moment('2006-07-15 13:00');
    new Event.Event(false, false, startDate, endDate);

    fromDate = moment('2006-07-04 10:00');
    toDate = moment('2006-07-10 10:00');
  });

  //test openings events
  test('GetOpeningsBetweenDates -> should return 2 availabilities', () => {
    const result = getOpeningsBetweenDates(fromDate, toDate);
    expect(result.length).toBe(2);
  });
  test('GetOpeningsBetweenDates -> should return 2 availabilities', () => {
    const result = getOpeningsBetweenDates(fromDate, toDate);
    expect(result.length).toBe(2);
  });

  //test busy events
  test('GetBusyEventsBetweenDates -> should return 2 busy events', () => {
    const result = getBusyEventsBetweenDates(fromDate, toDate);
    expect(result.length).toBe(2);
  });

  //test the 30 minutes splitting availabilities
  test('Split in 30 minutes opening events -> should return 27 opening events', () => {
    const result = splitInMinutes(getOpeningsBetweenDates(fromDate, toDate));
    expect(result.length).toBe(27);
  });

  //test
  test('Split in 30 minutes busy events -> should return 13 busy events', () => {
    const result = splitInMinutes(getBusyEventsBetweenDates(fromDate, toDate));
    expect(result.length).toBe(13);
  });

  test('GetAvailabilitiesDates for client -> should return 14 availabilities', () => {
    const openings = splitInMinutes(getOpeningsBetweenDates(fromDate, toDate));
    const busy = splitInMinutes(getBusyEventsBetweenDates(fromDate, toDate));
    const result = getAvailabilitiesDates(openings, busy);
    expect(result.length).toBe(14);
  });

  test("Display availabilties for client -> should return I'm not available any time!", () => {
    fromDate = moment('2006-07-01 08:00');
    toDate = moment('2006-07-01 10:00');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe("I'm not available any time!");
  });

  test("Display availabilties for client -> should return I'm not available any time!", () => {
    fromDate = moment('2006-07-08 11:30');
    toDate = moment('2006-07-08 12:30');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe("I'm not available any time!");
  });

  test('Display availabilties for client -> should return specific text', () => {
    fromDate = moment('2006-07-05 10:00');
    toDate = moment('2006-07-15 16:00');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe(
      "I'm available from \nJuly 8th at 10:30 , 11:00 , 12:30 , 13:00 , 13:30 \nJuly 9th at 08:00 , 08:30 , 09:00 , 09:30 , 10:00 , 16:00 , 16:30 , 17:00 , 17:30 \nJuly 15th at 13:00 , 13:30 ."
    );
  });

  test('Display availabilties for client asking for short range dates -> should return specific text', () => {
    fromDate = moment('2006-07-01 11:00');
    toDate = moment('2006-07-01 13:00');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe(
      "I'm available from \nJuly 1st at 11:00 , 11:30 , 12:00 , 12:30 ."
    );
  });

  test('Display availabilties for client asking for short range dates start between opening date -> should return specific text', () => {
    fromDate = moment('2006-07-01 13:00');
    toDate = moment('2006-07-01 14:00');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe("I'm available from \nJuly 1st at 13:00 , 13:30 .");
  });

  test('Display availabilties for client asking for short range dates end between opening date -> should return specific text', () => {
    fromDate = moment('2006-07-01 09:00');
    toDate = moment('2006-07-01 11:00');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe("I'm available from \nJuly 1st at 10:30 .");
  });

  test('Display availabilties for client asking for short range dates on opening non recurring -> should return specific text', () => {
    fromDate = moment('2006-07-01 16:00');
    toDate = moment('2006-07-01 17:00');
    const result = availabilities(fromDate, toDate);
    expect(result).toBe("I'm available from \nJuly 1st at 16:00 , 16:30 .");
  });
});
