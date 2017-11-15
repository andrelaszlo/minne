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

    // Signin with popup is not supported in Cordova
    this.auth.auth.signInWithRedirect(authProvider)
      .then( result => {
        // This gives you a Google Access Token.
        // You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log(token, user);
      }).catch(function(error) {
        // Handle Errors here.
        console.log(error.message);
      });
  }

  logout() {
    this.auth.auth.signOut();
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
          resolve(user);
        } else {
          console.log("getUserPromise rejecting promise");
          reject();
        }
      })
    });
  }

}
