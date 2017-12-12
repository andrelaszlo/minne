// RX
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap'; // flatMap still exists as an alias
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';

// Angular
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

// Ionic
import { LocalNotifications } from '@ionic-native/local-notifications';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HockeyApp } from 'ionic-hockeyapp';

// Firebase
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

// Main app imports
import { MyApp } from './app.component';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentsModule } from '../components/components.module';
import { localNotificationsFactory } from '../lib/local-notifications';

// Components
import { MainMenuComponent } from '../components/main-menu/main-menu';
import { TabImport } from '../pages/config/tab-import';

// Page modules
import { AddPageModule } from '../pages/add/add.module';
import { ArchivePageModule } from '../pages/archive/archive.module';
import { CalendarPageModule } from '../pages/calendar/calendar.module';
import { ConfigPageModule } from '../pages/config/config.module';
import { EditPageModule } from '../pages/edit/edit.module';
import { GoalsPageModule } from '../pages/goals/goals.module';
import { InboxPageModule } from '../pages/inbox/inbox.module';
import { LoginPageModule } from '../pages/login/login.module';

// Pages
import { AddPage } from '../pages/add/add';
import { ArchivePage } from '../pages/archive/archive';
import { CalendarPage } from '../pages/calendar/calendar';
import { ConfigPage } from '../pages/config/config';
import { EditPage } from '../pages/edit/edit';
import { GoalsPage } from '../pages/goals/goals';
import { InboxPage } from '../pages/inbox/inbox';
import { LoginPage } from '../pages/login/login';

// Pipes
import { HumanTimePipe } from '../pipes/human-time/human-time';
import { FormatToLocalPipe } from '../pipes/format-to-local/format-to-local';

// Providers
import { FirebaseProvider } from '../providers/firebase/firebase';
import { AuthProvider } from '../providers/auth/auth';
import { ConfigProvider } from '../providers/config/config';
import { NotificationProvider } from '../providers/notification/notification';


const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "calico-dev.firebaseapp.com",
  databaseURL: "https://calico-dev.firebaseio.com",
  projectId: "calico-dev",
  storageBucket: "",
  messagingSenderId: "***REMOVED***"
};

export const googleConfig = {
  secret: '***REMOVED***',
  id: '***REMOVED******REMOVED***'
}


@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    AngularFirestoreModule,
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp,{
      preloadModules: true
    }),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot(),

    ComponentsModule,
    PipesModule,

    AddPageModule,
    ArchivePageModule,
    CalendarPageModule,
    ConfigPageModule,
    EditPageModule,
    GoalsPageModule,
    InboxPageModule,
    LoginPageModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MainMenuComponent,

    AddPage,
    ArchivePage,
    CalendarPage,
    ConfigPage,
    EditPage,
    GoalsPage,
    InboxPage,
    LoginPage,

    TabImport
  ],
  providers: [
    HockeyApp,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider,
    AngularFireAuth,
    AuthProvider,
    ConfigProvider,
    NotificationProvider,
    {provide: LocalNotifications, useFactory: localNotificationsFactory, deps: [Platform]}
  ]
})
export class AppModule {}
