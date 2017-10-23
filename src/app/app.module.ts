import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { UserAgent } from '@ionic-native/user-agent';

import { MyApp } from './app.component';
import { InboxPage } from '../pages/inbox/inbox';
import { ArchivePage } from '../pages/archive/archive';
import { AddPage } from '../pages/add/add';
import { EditPage } from '../pages/edit/edit';
import { LoginPage } from '../pages/login/login';
import { LoginPageModule } from '../pages/login/login.module';


import { MainMenuComponent } from '../components/main-menu/main-menu';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { AuthProvider } from '../providers/auth/auth';
import { ConfigProvider } from '../providers/config/config';

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
    MainMenuComponent,
    InboxPage,
    ArchivePage,
    AddPage,
    EditPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicModule.forRoot(MyApp),
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
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseProvider,
    AngularFireAuth,
    AuthProvider,
    ConfigProvider,
    UserAgent
  ]
})
export class AppModule {
  
  constructor(private userAgent: UserAgent) {
    let userAgentString: string = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
    this.userAgent.set(userAgentString)
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }
}
