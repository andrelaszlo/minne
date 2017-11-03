import { Component } from '@angular/core';
import { AuthProvider } from '../../providers/auth/auth';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import * as moment from 'moment-timezone';

declare var BuildInfo: any;

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  appName: string;
  buildInfo: string = "Unknown version";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthProvider,
    configProvider: ConfigProvider,
    public platform: Platform,
  ) {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.buildInfo = `${BuildInfo.displayName} ${BuildInfo.version} ${BuildInfo.buildType} built ${moment(BuildInfo.buildDate).calendar()}`;
      }
    });
    this.appName = configProvider.applicationName;
  }

  login(provider: string) {
    this.auth.login(provider);
  }

}
