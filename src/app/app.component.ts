import * as firebase from "firebase";
import * as moment from 'moment';

import { AngularFireAuth } from 'angularfire2/auth';

import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AuthProvider } from '../providers/auth/auth';
import { ConfigProvider } from '../providers/config/config';
import { NotificationProvider } from '../providers/notification/notification';

import { InboxPage } from '../pages/inbox/inbox';
import { LoginPage } from '../pages/login/login';
import { ArchivePage } from '../pages/archive/archive';
import { CalendarPage } from '../pages/calendar/calendar';
import { GoalsPage } from '../pages/goals/goals';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{title: string, icon: string, component: any}>;

  user: any;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public authProvider: AuthProvider,
    public configProvider: ConfigProvider,
    public notificationProvider: NotificationProvider,
    afAuth: AngularFireAuth,
  ) {
    this.pages = [
      { title: 'Home', icon: 'home', component: GoalsPage },
      { title: 'Calendar', icon: 'calendar', component: CalendarPage },
      { title: 'To-do', icon: 'checkmark-circle', component: InboxPage },
      { title: 'Drafts', icon: 'happy', component: InboxPage },
      { title: 'Archive', icon: 'folder', component: ArchivePage },
    ];

    const authObserver = afAuth.authState.subscribe( user => {
      this.user = user;
      if (!user) {
        this.rootPage = 'LoginPage';
      } else {
        this.rootPage = GoalsPage;
      }
    });

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      console.log("Platform ready")
      moment.locale(this.configProvider.getLocale());
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    }).catch(err => console.log("Platform ready error", err));
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    this.authProvider.logout();
    this.nav.setRoot(LoginPage);
  }
}
