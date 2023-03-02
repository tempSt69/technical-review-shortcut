const { Event } = require('./event');
const moment = require('moment/moment');

var startDate = moment('2006-07-01 10:30');
var endDate = moment('2006-07-01 14:00');
new Event(true, true, startDate, endDate);

startDate = moment('2006-07-08 11:30');
endDate = moment('2006-07-08 12:30');
new Event(false, false, startDate, endDate);

var fromDate = moment('2006-07-04 10:00');
var toDate = moment('2006-07-20 10:00');
console.log(Event.prototype.availabilities(fromDate, toDate));
