import * as firebase from 'firebase';
import * as moment from 'moment';

import { HockeyApp } from 'ionic-hockeyapp';
import { AngularFireAuth } from 'angularfire2/auth';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ViewController, App, AlertController } from 'ionic-angular';
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
    public googleAnalytics: GoogleAnalytics,
    public alertCtrl: AlertController,
    afAuth: AngularFireAuth,
  ) {
    this.pages = [
      { title: 'Home', icon: 'home', component: GoalsPage },
      { title: 'Calendar', icon: 'calendar', component: CalendarPage },
      { title: 'To-do', icon: 'checkmark-circle', component: TodoPage },
      { title: 'Notes', icon: 'book', component: NotesPage },
      { title: 'Archive', icon: 'folder', component: ArchivePage },
    ];

    this.platform.ready().then(() => {

      this.initializeApp();

      const authObserver = afAuth.authState.subscribe( user => {

        this.initializeUser(user);

        if (!user) {
          this.rootPage = 'login';
        } else if (this.nav.getActive().component === LoginPage) {
          this.rootPage = GoalsPage;
        } else {
          if (this.nav.getActive().component === LoginPage) {
            this.rootPage = GoalsPage;
          } else  {
            console.log("Logged in, not redirecting from", this.nav.getActive().component);
          }
        }
      });

    }).catch(err => console.log("Platform ready error", err))
  }

  private initializeApp() {
    console.log("Platform ready")

    if(this.platform.is('cordova')) {
      this.initializeHockeyApp();
      this.initializeGoogleAnalytics();
    }

    moment.locale(this.configProvider.getLocale());
    this.statusBar.styleDefault();
    this.statusBar.show();
    this.splashScreen.hide();
  }

  private initializeUser(user: any) {
    if (!user) {
      return;
    }
    console.log("Logged in as", user);

    this.user = user;

    if (this.platform.is('cordova')) {
      this.googleAnalytics.setUserId(user.uid);

      this.hockeyApp.setUserName(user.displayName);
      if (user.email) {
        this.hockeyApp.setUserEmail(user.email);
      }
    }

    firebase.auth().getRedirectResult().then(result => {
      console.log("Redirect results", result)
      if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // Make sure that the scope you need is added, see AuthenticationProvider
        var token = result.credential.accessToken;
        if (token) {
          this.firebaseProvider.setUserField('googleAccessToken', token);
          this.firebaseProvider.canImport()
            .then(() => this.showImportDialog())
            .catch(err => console.log("Calendars can't be imported", err));
        }
      }
    }).catch(function(error) {
      console.error("Login error", error.code, error.message, error.email, error.credential);
    });

  }

  private showImportDialog() {
    let prompt = this.alertCtrl.create({
      title: 'Import',
      message: "Do you want to import your data from Google Calendar?",
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes, import!',
          handler: data => {
            this.firebaseProvider.startImport();
          }
        }
      ]
    });
    prompt.present();
  }

  private initializeGoogleAnalytics() {
    this.googleAnalytics.startTrackerWithId('UA-110874991-1');
    this.googleAnalytics.enableUncaughtExceptionReporting(true);
    this.googleAnalytics.addCustomDimension(1, 'minne:n_events_on_start_view');
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

  sendFeedback() {
    window.open('mailto:andre@laszlo.nu,hnarjis@gmail.com?subject=Feedback', '_system');
  }

  logout() {
    this.authProvider.logout();
    this.nav.setRoot(LoginPage);
  }
}
