const moment = require('moment/moment');
var eventList = [];

const CONST_MINUTES_SLOT = 30;

var Event = function (opening, recurring, startDate, endDate) {
  if (startDate >= endDate) {
    this.error = true;
    return;
  }
  this.opening = opening;
  this.recurring = recurring;
  this.startDate = startDate;
  this.endDate = endDate;

  eventList.push(this);
};

resetEventList = () => {
  eventList = [];
};

/*
retrieves every openings schedules between the 2 dates asked by client
it'll add opening events if it's recurring and the next week date occurence is between the 2 dates
it'll save the opening event between two dates as it is if not recurring
*/
getOpeningsBetweenDates = function (startDate, endDate) {
  const openings = [];
  eventList
    .filter(
      (event) =>
        (event.opening &&
          (event.recurring ||
            startDate.isBetween(event.startDate, event.endDate) ||
            endDate.isBetween(event.startDate, event.endDate))) ||
        (startDate < event.startDate && endDate > event.endDate)
    )
    .forEach((event) => {
      if (event.recurring) {
        const nextStartOccurrence = moment(event.startDate).add(1, 'week');
        const nextEndOccurrence = moment(event.endDate).add(1, 'week');

        while (nextStartOccurrence.isBefore(endDate)) {
          openings.push({
            ...event,
            startDate: moment(nextStartOccurrence),
            endDate:
              nextEndOccurrence > endDate
                ? moment(endDate)
                : moment(nextEndOccurrence),
          });
          nextStartOccurrence.add(1, 'week');
          nextEndOccurrence.add(1, 'week');
        }
      } else {
        openings.push(event);
      }
    });

  //sort it for cleaner displaying next
  return openings.sort((a, b) => a.startDate - b.startDate);
};

/*
it simply retrieves busy events that are between the 2 dates.
*/
getBusyEventsBetweenDates = function (startDate, endDate) {
  return eventList.filter((event) => {
    if (event.opening) {
      return false;
    }
    return (
      event.startDate.isBetween(startDate, endDate) ||
      event.endDate.isBetween(startDate, endDate) ||
      (startDate < event.startDate && endDate > event.endDate)
    );
  });
};

/*
this is related to our core settings business
it split every events into small events of CONST_MINUTES_SLOT (actually 30 minutes)
you can change CONST_MINUTES_SLOT to 60 if one day the business switch from 30 minutes appointments to 1h for example.
It helps to show availabilities by CONST_MINUTES_SLOT each.
*/
splitInMinutes = (events) => {
  let splittedTimers = [];
  events.forEach((ev) => {
    const nextOccurence = moment(ev.startDate);
    while (nextOccurence.isBefore(ev.endDate)) {
      splittedTimers.push({
        startDate: moment(nextOccurence),
        endDate: moment(nextOccurence.add(CONST_MINUTES_SLOT, 'minutes')),
      });
    }
  });
  return splittedTimers;
};

getAvailabilitiesDates = function (openings, busySlots) {
  return openings.filter((opening) => {
    return !busySlots.some(
      (busy) =>
        opening.startDate.isBetween(busy.startDate, busy.endDate) ||
        opening.startDate.unix() == busy.startDate.unix()
    );
  });
};

availabilities = function (fromDate, toDate) {
  //retrive what we need (opening & busy slots)
  const openings = splitInMinutes(getOpeningsBetweenDates(fromDate, toDate));
  const busySlots = splitInMinutes(getBusyEventsBetweenDates(fromDate, toDate));

  //if no availability at all
  if (openings.length === 0) {
    return "I'm not available any time!";
  }

  //filter every slots finally available and remap it well
  const availableSlots = getAvailabilitiesDates(openings, busySlots);

  //recheck if no availability at all
  if (availableSlots.length === 0) {
    return "I'm not available any time!";
  }

  return `I'm available from ${display(availableSlots)}.`;
};

/*
Displays the wanted text with days and specific availabilities
I wanted to do this in a more elgant way by using the new "group" javascript function 
but it's not available yet
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/group
*/
display = function (availableSlots) {
  let text = '';
  let lastDay = '';
  availableSlots.forEach((slot) => {
    const dayDisplay = slot.startDate.format('MMMM Do [at] ');
    if (lastDay != dayDisplay) {
      lastDay = dayDisplay;
      text += `\n${dayDisplay}`;
      text += `${slot.startDate.format('HH:mm')} `;
    } else text += `, ${slot.startDate.format('HH:mm')} `;
  });
  return text;
};

module.exports = {
  Event,
  eventList,
  resetEventList,
  getAvailabilitiesDates,
  availabilities,
  display,
  getBusyEventsBetweenDates,
  getOpeningsBetweenDates,
  splitInMinutes,
};
