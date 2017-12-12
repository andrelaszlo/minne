import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { HockeyApp } from 'ionic-hockeyapp';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

@Component({
  selector: 'tab-feedback',
  templateUrl: 'tab-feedback.html',
})
export class TabFeedback {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public hockeyApp: HockeyApp,
    public platform: Platform,
    public googleAnalytics: GoogleAnalytics,
  ) {
    this.googleAnalytics.trackView('TabFeedback');
  }

  sendFeedback() {
    if (this.platform.is('cordova')) {
      this.hockeyApp.feedback();
    } else {
      window.open('mailto:andre@laszlo.nu,hnarjis@gmail.com?subject=Feedback', '_system');
    }
  }
}
