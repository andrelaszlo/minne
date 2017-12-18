import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as firebaseAuth from '@firebase/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthProvider {

  public AuthService = AuthProvider;

  constructor(public http: Http, private auth: AngularFireAuth) {
  }

  login(provider: string) {
    var authProvider = new firebase.auth.GoogleAuthProvider();
    authProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    // https://developers.google.com/identity/protocols/OpenIDConnect#authenticationuriparameters
    authProvider.setCustomParameters({prompt: 'consent'});

    console.log("Auth provider", authProvider);

    // Signin with popup is not supported in Cordova
    //this.auth.auth.languageCode = 'fr';
    this.auth.auth.signInWithRedirect(authProvider);
  }

  logout() {
    this.auth.auth.signOut().then(() => console.log("Signed out")).catch(err => console.warn("Error signing out", err))
  }

  getUser(throwError: boolean = true) {
    let user = this.auth.auth.currentUser;
    if (!user && throwError) {
      throw "No user is currently signed in";
    }
    return user;
  }

  getUserPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      let unsubscribe = this.auth.auth.onAuthStateChanged(user => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          console.log("getUserPromise rejecting promise");
          reject();
        }
      })
    });
  }

}
