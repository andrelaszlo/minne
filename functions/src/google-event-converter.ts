import * as moment from 'moment';

/*
   archived true
   content "another note without time"
   date "2017-11-29T08:00:00+01:00"
   endDate "2017-11-29T09:00:00+01:00"
   isEvent true
   isTodo true
   user "2Pe77jpkrRcm4CA6hBVLw13UfSk1"
 */

function parseTime(event, field) {
  /*
     start: { dateTime: '2017-11-06T18:30:00+01:00' },
     end: { dateTime: '2017-11-06T19:30:00+01:00' },
   */
  let timeObj = event[field]; // eg 'start' or 'end'
  if (!timeObj) {
    console.warn(`Undefined field ${field} in event`, event);
  }
  if (timeObj['dateTime']) {
    return moment(timeObj['dateTime']).toDate();
  } else if (timeObj['date']) {
    return moment(timeObj['date']).toDate();
  } else {
    throw event;
  }
}

function isFullDay(event) {
  return !!event['start']['date'];
}

function guessTodo(description) {
  // If it matches any of these regexes, it's a todo
  const regexes = [
    /^move\W/i,
    /^fix\W/i,
    /^finish\W/i,
    /(^|\W)todo\W/i,
    /(^|\W)todo\W/i,
  ];
  for (let re of regexes) {
    if (description.match(re)) {
      return true;
    }
  }
  return false;
}

export function convert(config, event) {
  let note: any = {};
  note.user = config.user;
  note.archived = false;
  note.date = parseTime(event, 'start');
  note.endDate = parseTime(event, 'end');
  note.isFullDay = isFullDay(event);
  note.content = event.summary.trim();
  note.isEvent = true;
  note.isImported = true;
  note.isTodo = guessTodo(note.content);
  note.tags = ['imported', 'google'];
  note._googleEvent = JSON.parse(JSON.stringify(event));
  return note;
}
