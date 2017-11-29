import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';
import { ConfigProvider} from '../../providers/config/config';

@Pipe({
  name: 'humanTime',
})
export class HumanTimePipe implements PipeTransform {

  constructor(public config: ConfigProvider) {}

  transform(value: Date, ...args) {
    var date = moment(value);
    var timezone = this.config.getTimeZone();
    if (timezone) {
      date = date.tz(timezone);
    }
    return date.calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function(date) {
        let endOfYear = moment().endOf("year");
        if (this.isAfter(endOfYear)) {
          return 'ddd, MMM DD Y';
        }
        return 'ddd, MMM DD';
      }
    });
  }
}
