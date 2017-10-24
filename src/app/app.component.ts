import * as firebase from "firebase";

import { AngularFireAuth } from 'angularfire2/auth';

import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AuthProvider } from '../providers/auth/auth';

import { InboxPage } from '../pages/inbox/inbox';
import { LoginPage } from '../pages/login/login';
import { ArchivePage } from '../pages/archive/archive';
import { CalendarPage } from '../pages/calendar/calendar';

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
    afAuth: AngularFireAuth,
  ) {
    this.pages = [
      { title: 'Drafts', icon: 'happy', component: InboxPage },
      { title: 'Archive', icon: 'folder', component: ArchivePage },
      { title: 'Calendar', icon: 'calendar', component: CalendarPage },
      { title: 'To-do', icon: 'checkmark-circle', component: InboxPage },
    ];

    const authObserver = afAuth.authState.subscribe( user => {
      this.user = user;
      console.log("user", user);
      if (!user) {
        this.rootPage = 'LoginPage';
      } else { 
        this.rootPage = InboxPage;
      }
    });

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      console.log("platform ready, root", this.rootPage);
    });
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
