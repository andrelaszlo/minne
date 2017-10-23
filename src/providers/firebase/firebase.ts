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

  getSortedItems(): Observable<any> {
    return this.angularFireDatabase.list('/notes', ref => ref.orderByChild('date').startAt((new Date()).toISOString()))
    .snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });;
  }

  saveItem(key, item) {
    this.angularFireDatabase.object(`/notes/${key}`).update(item);
  }

  addItem(note) {
    // TODO: input validation
    this.angularFireDatabase.list(`/notes/`).push(note);
  }

}
