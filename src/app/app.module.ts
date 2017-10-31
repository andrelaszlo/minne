import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { InboxPage } from '../pages/inbox/inbox';
import { ArchivePage } from '../pages/archive/archive';
import { AddPage } from '../pages/add/add';
import { EditPage } from '../pages/edit/edit';
import { LoginPage } from '../pages/login/login';
import { CalendarPage } from '../pages/calendar/calendar';
import { LoginPageModule } from '../pages/login/login.module';

import { HumanTimePipe } from '../pipes/human-time/human-time';
import { FormatToLocalPipe } from '../pipes/format-to-local/format-to-local';

import { MainMenuComponent } from '../components/main-menu/main-menu';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { AngularFirestoreModule } from 'angularfire2/firestore';
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


@NgModule({
  declarations: [
    MyApp,
    HumanTimePipe,
    FormatToLocalPipe,
    MainMenuComponent,
    InboxPage,
    ArchivePage,
    AddPage,
    EditPage,
    CalendarPage
  ],
  imports: [
    AngularFirestoreModule,
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    LoginPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MainMenuComponent,
    InboxPage,
    ArchivePage,
    AddPage,
    EditPage,
    LoginPage,
    CalendarPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider,
    AngularFireAuth,
    AuthProvider,
    ConfigProvider,
    NotificationProvider
  ]
})
export class AppModule {}
