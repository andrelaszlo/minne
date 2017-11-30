import { Component, ElementRef } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { ConfigProvider} from '../../providers/config/config';

import * as moment from 'moment-timezone';

@IonicPage({
  name: 'add'
})
@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
})
export class AddPage {

  note: any = {'content': ''};
  isEvent: boolean;
  isTodo: boolean;

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public authProvider: AuthProvider,
    public config: ConfigProvider
  ) {
    let startDay = this.navParams.get("startDay");
    if (startDay == moment().startOf('day').format()) {
      this.note['date'] = moment();
    } else {
      this.note['date'] = moment(this.navParams.get("startDay")).add(8, 'hours');
    }
    this.note['endDate'] = moment(this.note['date']).add(1, 'hours');
  }

  changeDate(newDate) {
    this.note.date = newDate;
    this.note['endDate'] = moment(newDate).add(1, 'hours');
  }

  saveNote() {
    // TODO: move all this note logic to a provider or something
    this.note['user'] = this.authProvider.getUser().uid;
    this.note['archived'] = !!this.note['archived'];
    var timezone = this.config.getTimeZone();
    var date = moment(this.note['date']);
    var endDate = moment(this.note['endDate']);
    if (timezone) {
      date = date.tz(timezone);
      endDate = endDate.tz(timezone);
    }
    this.note['date'] = date.format();
    this.note['endDate'] = endDate.format();
    this.note['isEvent'] = this.isEvent ? true : false;
    this.note['isTodo'] = this.isTodo ? true : false;
    this.note['isChecked'] = !!this.note['isChecked'];
    this.firebaseProvider.addItem(this.note);
    this.viewCtrl.dismiss();
  }

  dismiss() {
    this.navCtrl.pop();
  }

}
