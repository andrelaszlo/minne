import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseProvider {

  constructor(
    public http: Http,
    public angularFireDatabase: AngularFireDatabase) {
  }

  getItems(): Observable<any> {
    return this.angularFireDatabase.list('/notes').snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

}
