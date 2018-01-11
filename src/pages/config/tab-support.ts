import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

declare var BuildInfo: any;

@Component({
  selector: 'tab-support',
  templateUrl: 'tab-support.html',
})
export class TabSupport {

  userId: string;
  buildInfo: any;
  platforms: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    private platform: Platform,
    public googleAnalytics: GoogleAnalytics,
  ) {
    this.authProvider.getUserPromise().then(user => {
      this.userId = user.uid;
      console.log("User", user);
    }).catch(e => console.log('Error getting user', e));

    this.platform.ready().then(() => {
      this.platforms = this.platform.platforms().join(', ');

      if (typeof(BuildInfo) != 'undefined') {
        this.buildInfo = BuildInfo;
      } else {
        console.log("No build info available");
      }
    }).catch(e => console.log('Error in platform.ready', e));

    this.googleAnalytics.trackView('TabSupport');
  }
}
