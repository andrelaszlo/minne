import { Platform } from 'ionic-angular';
import { AuthProvider } from '../auth/auth';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { googleAnalyticsTrackingId } from '../../app/app.module';

declare var BuildInfo: any;

@Injectable()
export class AnalyticsProvider {

  constructor(
    public http: HttpClient,
    private ga: GoogleAnalytics,
    private authProvider: AuthProvider,
    private platform: Platform
  ) {
    this.ga.startTrackerWithId(googleAnalyticsTrackingId)
      .then(() => {
        console.log('Google analytics is ready');
        this.authProvider.getUserPromise().then(user => this.ga.setUserId(user.uid));
        this.platform.ready().then(() => {
          if (this.platform.is('cordova')) {
            this.ga.setAppVersion(BuildInfo.version);            
          } else {
            this.ga.setAppVersion('dev');
          }
        }).catch(err => console.log("Error in platform ready", err));
        setInterval(() => {this.ga.trackView('test'); console.log("Tracking view 'test'")}, 5000);
             
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

}
