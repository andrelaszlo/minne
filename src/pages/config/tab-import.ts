import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

declare var gapi;

@Component({
  selector: 'tab-import',
  templateUrl: 'tab-import.html',
})
export class TabImport {

  hasGoogleAccessToken: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private firebaseProvider: FirebaseProvider
  ) {
    firebaseProvider.getUserField('googleAccessToken').forEach(token => this.hasGoogleAccessToken = !!token);
  }

  importGoogleCal() {

  }
}
