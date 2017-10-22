import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase'

@IonicPage()
@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
})
export class AddPage {

  note: any = {content: ""};

  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider
  ) {
  }

  saveNote() {
    this.firebaseProvider.addItem(this.note);
    this.viewCtrl.dismiss();
  }

}
