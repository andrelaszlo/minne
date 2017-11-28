import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';

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
  public isEvent;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider) {
      this.note = navParams.get("note");
      this.id = this.note.id;
      this.isEvent = this.note['isEvent'];
  }

  changeDate(newDate) {
    this.note.date = newDate;
    this.note['endDate'] = moment(newDate).add(1, 'hours').format();
  }

  saveNote() {
    this.note['isEvent'] = this.isEvent ? true : false;
    this.firebaseProvider.saveItem(this.note.id, this.note);
    this.viewCtrl.dismiss();
  }

  dismiss() {
    this.navCtrl.pop();
  }

}
