import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import 'rxjs/add/operator/map';

@Injectable()
export class DateProvider {

  constructor(public http: Http) {
    //console.log("system date", new Date().toISOString(), "node-time date", Moment().add(2, 'seconds').toISOString());
  }

  now() {
    return moment.now();
  }

}
