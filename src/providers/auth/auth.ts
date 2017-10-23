import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { FirebaseProvider } from '../firebase/firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthProvider {

  constructor(public http: Http, private firebaseProvider: FirebaseProvider, private auth: AngularFireAuth) {
  }

  login() {
		let provider = new firebase.auth.GoogleAuthProvider();
		this.auth.auth.signInWithPopup(provider);
  }

}
