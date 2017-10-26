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
    return date.calendar(null, {sameElse: this.formatOthers});
  }

  private formatOthers() {
    var thisYear = null;
    return 'MMM Do';
  }
}
