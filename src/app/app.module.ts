import { InboxPageModule } from '../pages/inbox/inbox.module';
import { GoalsPageModule } from '../pages/goals/goals.module';
import { EditPageModule } from '../pages/edit/edit.module';
import { CalendarPageModule } from '../pages/calendar/calendar.module';
import { ArchivePageModule } from '../pages/archive/archive.module';
import { AddPageModule } from '../pages/add/add.module';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentsModule } from '../components/components.module';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { Platform } from 'ionic-angular';

import { MyApp } from './app.component';
import { InboxPage } from '../pages/inbox/inbox';
import { ArchivePage } from '../pages/archive/archive';
import { AddPage } from '../pages/add/add';
import { EditPage } from '../pages/edit/edit';
import { LoginPage } from '../pages/login/login';
import { CalendarPage } from '../pages/calendar/calendar';
import { GoalsPage } from '../pages/goals/goals';
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
import { localNotificationsFactory } from '../lib/local-notifications';


const firebaseConfig = {
  apiKey: "AIzaSyDGAn4uKvIlW8JItNIDyBifGpSP_IWj1js",
  authDomain: "calico-dev.firebaseapp.com",
  databaseURL: "https://calico-dev.firebaseio.com",
  projectId: "calico-dev",
  storageBucket: "",
  messagingSenderId: "442132493927"
};


@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    AngularFirestoreModule,
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),

    ComponentsModule,
    PipesModule,

    AddPageModule,
    ArchivePageModule,
    CalendarPageModule,
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
    EditPage,
    GoalsPage,
    InboxPage,
    LoginPage,    
  ],
  providers: [
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
