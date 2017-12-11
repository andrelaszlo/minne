import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
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

  constructor(
    public http: Http,
    public angularFireDatabase: AngularFireDatabase,
    public authProvider: AuthProvider,
    public angularFireStore: AngularFirestore
  ) {
    this.notesCollection = angularFireStore.collection<Note>('notes');
    this.usersCollection = angularFireStore.collection<User>('users');
    this.jobsCollection = angularFireStore.collection<Job>('jobs');
  }

  private getNotesByQuery(filterFn: QueryFn): Observable<Note[]> {
    var notesCollection = this.angularFireStore.collection<Note>('notes', filterFn);
    var notes: Observable<Note[]> = notesCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Note;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
    return notes;
  }

  private anyToUTC(datelike: any) {
    return moment(datelike).utc().toDate();
  }

  private getNotesByTime(afterTime?: any, beforeTime?: any, order?: string, customFilter?: (Query) => Query): Observable<Note[]> {
    let user = this.authProvider.getUser(false);
    if (!user) {
      console.log("User not logged in");
      return Observable.empty();
    }
    let userId = user.uid;
    return this.getNotesByQuery(
      ref => {
        let query = ref
          .where('user', '==', userId)
          .where('archived', '==', false)
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

  private updateUser(updates: any): Promise<void> {
    return this.authProvider.getUserPromise().then(user => {
      return this.usersCollection.doc(user.uid).set(updates, {merge: true});
    });
  }

  getFreeHours(date?): Observable<number> {
    let start = moment(date).startOf('day').add(8, 'hours');
    let end = moment(date).startOf('day').add(18, 'hours');

    // Start from now if it is today after the start of the day
    if (moment().isAfter(start) && moment().isBefore(end)) {
      start = moment();
    }


    return this.getNotesByTime(start, end, null, (query) => query.where('isEvent', "==", true)).map(notes => {

      let totalHours = end.diff(start, 'hours');
      for (let note of notes) {
        let startDate = moment(note['date']);
        let endDate = moment(note['endDate']);
        let itemDuration = endDate.diff(startDate, 'hours');
        totalHours = totalHours - itemDuration;
      }
      return Math.max(0, totalHours);
    });
  }

  getItems(): Observable<Note[]> {
    return this.getNotesByTime();
  }

  getEvents(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, (query) => query.where('isEvent', "==", true));
  }

  getTodos(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, (query) => query.where('isTodo', "==", true));
  }

  getNotes(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, (query) => query.where('isEvent', "==", false).where('isTodo', "==", false));
  }

  getArchivedItems(): Observable<Note[]> {
    return this.getNotesByTime(null, null, null, (query) => query.where('archived', "==", true));
  }

  getSortedItems(): Observable<Note[]> {
    return this.getNotesByTime(moment().startOf('day'));
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
    this.angularFireStore
      .doc<Note>(`notes/${id}`)
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

  toggleCheck(id, note, toggleState) {
    note['isChecked'] = toggleState;
    this.saveItem(id, note);
  }

  delete(note) {
    const key = note['id'];
    if(!key) {
      throw new Error('The note id was not found');
    }
    this.angularFireStore
      .doc<Note>(`notes/${note.id}`)
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
