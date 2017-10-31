import { Component, ElementRef } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { ConfigProvider} from '../../providers/config/config';

import * as moment from 'moment-timezone';

@IonicPage()
@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
})
export class AddPage {

  note: any = {'content': ''};

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public authProvider: AuthProvider,
    public config: ConfigProvider
  ) {
  }

  saveNote() {
    // TODO: move all this note logic to a provider or something
    this.note['user'] = this.authProvider.getUser().uid;
    this.note['archived'] = !!this.note['archived'];
    var timezone = this.config.getTimeZone();
    var date = moment(this.note['date']);
    if (timezone) {
      date = date.tz(timezone);
    }
    this.note['date'] = date.format();
    this.firebaseProvider.addItem(this.note);
    this.viewCtrl.dismiss();
  }

  dismiss() {
    this.navCtrl.pop();
  }

}
