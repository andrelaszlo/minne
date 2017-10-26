import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

@Pipe({
  name: 'humanTime',
})
export class HumanTimePipe implements PipeTransform {

  transform(value: Date, ...args) {
      return moment(value).calendar();
  }
}
