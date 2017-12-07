import * as firebase from 'firebase';
import * as moment from 'moment';

import { AngularFireAuth } from 'angularfire2/auth';

import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ViewController } from 'ionic-angular';
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
import { FirebaseProvider } from '../providers/firebase/firebase';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{ title: string, icon: string, component: any }>;

  user: any;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public authProvider: AuthProvider,
    public configProvider: ConfigProvider,
    public notificationProvider: NotificationProvider,
    public firebaseProvider: FirebaseProvider,
    afAuth: AngularFireAuth,
  ) {
    this.pages = [
      { title: 'Home', icon: 'home', component: GoalsPage },
      { title: 'Calendar', icon: 'calendar', component: CalendarPage },
      { title: 'To-do', icon: 'checkmark-circle', component: InboxPage },
      { title: 'Drafts', icon: 'happy', component: InboxPage },
      { title: 'Archive', icon: 'folder', component: ArchivePage },
    ];

    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // Make sure that the scope you need is added, see AuthenticationProvider
        var token = result.credential.accessToken;
        if (token) {
          firebaseProvider.setGoogleAccessToken(token);
        }
      }
    }).catch(function(error) {
      console.error("Login error", error.code, error.message, error.email, error.credential);
    });

    const authObserver = afAuth.authState.subscribe(user => {
      this.user = user;
      console.log("Logged in as", user);
      if (!user) {
        this.rootPage = 'login';
      } else if (this.nav.getActive().component === LoginPage) {
        this.rootPage = GoalsPage;
      } else {
        console.log("Logged in, not redirecting from", this.nav.getActive().component);
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

  goToPage(page) {
    this.nav.push(page);
  }

  logout() {
    this.authProvider.logout();
    this.nav.setRoot(LoginPage);
  }
}
