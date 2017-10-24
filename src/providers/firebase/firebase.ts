import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { AuthProvider } from '../auth/auth';

@Injectable()
export class FirebaseProvider {

  constructor(
    public http: Http,
    public angularFireDatabase: AngularFireDatabase,
    public authProvider: AuthProvider
  ) {
  }

  getItems(includeArchived: boolean = false): Observable<any> {
    return this.angularFireDatabase
      .list(this.notesPath())
      .snapshotChanges()
      .map(changes => 
        changes
          .map(c => ({ key: c.payload.key, ...c.payload.val() }))
          .filter(item => includeArchived || item['archived'] != true)
      );
  }

  getSortedItems(): Observable<any> {
    return this.angularFireDatabase.list(this.notesPath(), ref => ref.orderByChild('date').startAt((new Date()).toISOString()))
      .snapshotChanges().map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      });
  }

  saveItem(key, item) {
    if (item['key']) {
      delete item['key'];
    }
    this.angularFireDatabase.object(`${this.notesPath()}/${key}`).update(item);
  }

  addItem(note) {
    // TODO: input validation
    this.angularFireDatabase.list(this.notesPath()).push(note);
  }

  archive(note) {
    note['archived'] = true;
    this.saveItem(note['key'], note);
  }

  private notesPath() {
    let userId = this.authProvider.getUser().uid;
    return `/users/${userId}/notes`;
  }

}
