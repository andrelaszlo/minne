import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

@Injectable()
export class ConfigProvider {
  applicationName: string = 'minne';

  constructor(public http: Http) {
  }

  getTimeZone() {
    return 'Europe/Paris';
  }

  getLocale() {
    return 'en-US';
  }

}
