import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { InboxPage } from '../pages/inbox/inbox';
import { ArchivePage } from '../pages/archive/archive';
import { AddPage } from '../pages/add/add';
import { EditPage } from '../pages/edit/edit';

import { MainMenuComponent } from '../components/main-menu/main-menu';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { FirebaseProvider } from '../providers/firebase/firebase';

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
    InboxPage,
    ArchivePage,
    AddPage,
    EditPage,
    MainMenuComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InboxPage,
    ArchivePage,
    AddPage,
    EditPage,
    MainMenuComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider
  ]
})
export class AppModule {
  public static applicationName = 'minne';
}
