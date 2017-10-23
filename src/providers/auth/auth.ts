import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as firebaseAuth from '@firebase/auth';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthProvider {

  public AuthService = AuthProvider;

  constructor(public http: Http, private auth: AngularFireAuth) {
  }

  login(provider: string) {
    var authProvider: firebaseAuth.AuthProvider;
    switch(provider) {
      case 'google':
        authProvider = new firebase.auth.GoogleAuthProvider();
        break;
      case 'facebook':
        authProvider = new firebase.auth.FacebookAuthProvider();
        break;
      case 'twitter':
        authProvider = new firebase.auth.TwitterAuthProvider();
        break;
      case 'github':
        authProvider = new firebase.auth.GithubAuthProvider();
        break;
    }

    this.auth.auth.signInWithPopup(authProvider);
  }

  logout() {
    this.auth.auth.signOut();
  }

  getUser() {
    let user = this.auth.auth.currentUser;
    if (!user) {
      throw "No user is currently signed in";
    }
    return user;
  }

}
