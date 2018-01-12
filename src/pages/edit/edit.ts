import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams, Platform } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import * as moment from 'moment-timezone';

@IonicPage({
  name: 'edit'
})
@Component({
  selector: 'page-edit',
  templateUrl: '../add/add.html',
})
export class EditPage {
  public note: any = {'content': null};
  public id: string = null;
  public isEvent: boolean;
  public isTodo: boolean;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public googleAnalytics: GoogleAnalytics,
    public platform: Platform,
    ) {
    this.note = navParams.get("note");
    this.id = this.note.id;
    this.isEvent = this.note['isEvent'];
    this.isTodo = this.note['isTodo'];
    this.googleAnalytics.trackView('EditPage');
  }

  changeDate(newDate) {
    this.note.date = newDate;
    this.note['endDate'] = moment(newDate).add(1, 'hours').format();
  }

  saveNote() {
    this.note['isEvent'] = this.isEvent ? true : false;
    this.note['isTodo'] = this.isTodo ? true : false;
    this.firebaseProvider.saveItem(this.note.id, this.note);
    this.viewCtrl.dismiss();
  }

  dismiss() {
    this.navCtrl.pop();
  }

  navigate() {
    let location = encodeURIComponent(this.note['location']);
    this.platform.ready().then(() => {
      if (this.platform.is('core') || this.platform.is('mobileweb')) {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${location}`);
      } else if (this.platform.is('ios')) {
        window.open(`maps://?q=${location}`, '_system');
      } else if (this.platform.is('android')) {
        window.open(`geo://?q=${location}`, '_system');
      };
    });
  }

}
