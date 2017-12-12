import * as firebase from 'firebase';
import * as moment from 'moment';

import { HockeyApp } from 'ionic-hockeyapp';
import { AngularFireAuth } from 'angularfire2/auth';

import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ViewController, App } from 'ionic-angular';
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
import { TodoPage } from '../pages/todo/todo';
import { NotesPage } from '../pages/notes/notes';
import { FirebaseProvider } from '../providers/firebase/firebase';

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
    public firebaseProvider: FirebaseProvider,
    public hockeyApp: HockeyApp,
    public app: App,
    afAuth: AngularFireAuth,
  ) {
    this.pages = [
      { title: 'Home', icon: 'home', component: GoalsPage },
      { title: 'Calendar', icon: 'calendar', component: CalendarPage },
      { title: 'To-do', icon: 'checkmark-circle', component: TodoPage },
      { title: 'Notes', icon: 'book', component: NotesPage },
      { title: 'Archive', icon: 'folder', component: ArchivePage },
    ];

    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // Make sure that the scope you need is added, see AuthenticationProvider
        var token = result.credential.accessToken;
        if (token) {
          firebaseProvider.setUserField('googleAccessToken', token);
        }
      }
    }).catch(function(error) {
      console.error("Login error", error.code, error.message, error.email, error.credential);
    });

    const authObserver = afAuth.authState.subscribe( user => {
      this.user = user;
      console.log("Logged in as", user);
      if (!user) {
        this.rootPage = 'login';
      } else {
        if (this.nav.getActive().component === LoginPage) {
          this.rootPage = GoalsPage;
        } else  {
          console.log("Logged in, not redirecting from", this.nav.getActive().component);
        }
        this.hockeyApp.setUserName(user.displayName);
        if (user.email) {
          this.hockeyApp.setUserEmail(user.email);
        }
      }
    });

    this.initializeApp();
  }

  private initializeApp() {
    this.platform.ready().then(() => {
      console.log("Platform ready")

      this.initializeHockeyApp();

      moment.locale(this.configProvider.getLocale());
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    }).catch(err => console.log("Platform ready error", err));
  }

  private initializeHockeyApp() {
    let androidAppId = '09e9a38ac0de43d596e45fdaa31687fe';
    let iosAppId = null;
    let autoSendCrashReports = true;
    let ignoreCrashDialog = true;

    this.hockeyApp.start(androidAppId, iosAppId, autoSendCrashReports, ignoreCrashDialog);

    // So app doesn't close when hockey app activities close
    // This also has a side effect of unable to close the app when on the rootPage and using the back button.
    // Back button will perform as normal on other pages and pop to the previous page.
    this.platform.registerBackButtonAction(() => {
      let nav = this.app.getRootNav();
      if (nav.canGoBack()) {
        nav.pop();
      } else {
        nav.setRoot(this.rootPage);
      }
    });
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
