import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { QueryFn } from 'angularfire2/firestore/interfaces';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../auth/auth';
import * as moment from 'moment-timezone';
import {Query} from '@firebase/firestore';

export interface Note {
  id: string;
  user: string;
  date: Date;
  content: string;
  archived: boolean;
  endDate: Date;
  isTodo: boolean;
  isEvent: boolean;
  isChecked: boolean;
}

export interface User {
  goal: string;
}

export interface Job {
  userId: string;
  type: string;
  payload: any;
  created: Date;
}


@Injectable()
export class FirebaseProvider {

  private notesCollection: AngularFirestoreCollection<Note>;
  private usersCollection: AngularFirestoreCollection<User>;
  private jobsCollection: AngularFirestoreCollection<Job>;
  private userRef: Promise<AngularFirestoreDocument<User>>;

  constructor(
    public http: Http,
    public angularFireDatabase: AngularFireDatabase,
    public authProvider: AuthProvider,
    public angularFireStore: AngularFirestore
  ) {
    this.jobsCollection = angularFireStore.collection<Job>('jobs');
    this.usersCollection = angularFireStore.collection<User>('users');
    this.userRef = this.authProvider.getUserPromise().then(user => {
      this.notesCollection = this.usersCollection.doc(user.uid).collection('notes');
      return this.usersCollection.doc<User>(user.uid);
    });
  }

  private getNotesByQuery(filterFn: QueryFn): Observable<Note[]> {
    return Observable.fromPromise(this.userRef)
      .flatMap(userRef => {
        var notesCollection = userRef.collection<Note>('notes', filterFn);
        var notes: Observable<Note[]> = notesCollection.snapshotChanges().map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Note;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        });
        return notes;
      });
  }

  private anyToUTC(datelike: any) {
    return moment(datelike).utc().toDate();
  }

  private getNotesByTime(afterTime?: any, beforeTime?: any, order?: string, archived: boolean = null, customFilter?: (Query) => Query): Observable<Note[]> {
    return Observable.fromPromise(this.authProvider.getUserPromise())
      .flatMap(user => {
        let userId = user.uid;
        return this.getNotesByQuery(ref => {
            let query = ref
              .where('user', '==', userId)
            if (archived === null) {
              query = query.where('archived', '==', false);
            } else {
              query = query.where('archived', '==', archived);
            }
            if (order == 'desc') {
              query = query.orderBy('date', 'desc');
            } else {
              query = query.orderBy('date', 'asc');
            }
            if (afterTime) {
              query = query.where('date', ">=", this.anyToUTC(afterTime));
            }
            if (beforeTime) {
              query = query.where('date', "<=", this.anyToUTC(beforeTime));
            }
            if (customFilter) {
              query = customFilter(query);
            }
            return query;
          }
        );
      }
    );
  }

  private updateUser(updates: any): Promise<void> {
    return this.authProvider.getUserPromise().then(user => {
      return this.usersCollection.doc(user.uid).set(updates, {merge: true});
    });
  }

  getItems(): Observable<Note[]> {
    return this.getNotesByTime();
  }

  getEvents(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, null, (query) => query.where('isEvent', "==", true));
  }

  getTodos(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, null, (query) => query.where('isTodo', "==", true));
  }

  getNotes(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, null, (query) => query.where('isEvent', "==", false).where('isTodo', "==", false));
  }

  getArchivedItems(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, true);
  }

  getSortedItems(): Observable<Note[]> {
    // TODO: make sure end date is synched with GoalsPage.getDays
    return this.getNotesByTime(moment().startOf('day'), moment().add(1, 'year').startOf('day'));
  }

  getUpcomingItems(): Observable<Note[]> {
    return this.getNotesByTime(moment(), moment().add(2, 'days'));
  }

  /**
   * Verify and/or convert some fields on a note before saving
   */
  private processNote(note: any) {
    if (note['id']) {
      delete note['id'];
    }
    if (note['date']) {
      note['date'] = this.anyToUTC(note['date']);
    }
    if (note['endDate']) {
      note['endDate'] = this.anyToUTC(note['endDate']);
    }
    return note;
  }

  saveItem(id, note): void {
    note = this.processNote(note);
    this.notesCollection
      .doc<Note>(id)
      .update(note);
  }

  addItem(note: Note): void {
    note = this.processNote(note);
    this.notesCollection.add(note);
  }

  getGoal(): Observable<string> {
    let user = this.authProvider.getUser(false);
    if (!user) {
      return Observable.empty();
    }
    let userId = user.uid;
    return this.usersCollection.doc(userId).valueChanges().map(user => {
      if (user && user['goal']) {
        return user['goal'];
      }
      return null;
    });
  }

  archive(id, note) {
    note['archived'] = true;
    this.saveItem(id, note);
  }

  unarchive(id, note) {
    note['archived'] = false;
    this.saveItem(id, note);
  }

  toggleCheck(id, note, toggleState) {
    note['isChecked'] = toggleState;
    this.saveItem(id, note);
  }

  delete(note) {
    const key = note['id'];
    if(!key) {
      throw new Error('The note id was not found');
    }
    this.notesCollection
      .doc<Note>(note.id)
      .delete();
  }

  addJob(type, payload): Promise<Job> {
    return this.authProvider.getUserPromise().then(user => {
      let job: Job = {
        userId: user.uid,
        type: 'import',
        payload: payload,
        created: moment().utc().toDate()
      }
      this.jobsCollection.add(job);
      return job;
    });
  }

  /**
   * Update a field on the logged in user
   * @param field The field to change, for example 'goal'
   * @param value The value to set, for example 'world domination'
   */
  setUserField(field: string, value: any): Promise<void> {
    let update = {};
    update[field] = value;
    return this.updateUser(update);
  }

  /**
   * Get an observable of a field on the signed in user object
   * @param field The field of the user object to subscribe to changes of
   */
  getUserField(field: string): Observable<any> {
    return Observable.fromPromise(this.authProvider.getUserPromise()).flatMap(user =>
      this.usersCollection.doc(user.uid).valueChanges().map(user => {
        return user[field];
      })
    );
  }

}
