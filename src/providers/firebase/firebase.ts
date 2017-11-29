import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { QueryFn } from 'angularfire2/firestore/interfaces';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from '../auth/auth';
import * as moment from 'moment-timezone';

export interface Note {
  id: string;
  user: string;
  date: Date;
  content: string;
  archived: boolean;
  endDate: Date;
}

export interface User {
  goal: string;
}

export interface Job {
  userId: string;
  type: string;
  payload: any;
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

  private getNotesByTime(afterTime?: any, beforeTime?: any, order?: string): Observable<Note[]> {
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
          query = query.where('date', ">=", afterTime);
        }
        if (beforeTime) {
          query = query.where('date', "<=", beforeTime);
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
    if (!date && moment().isAfter(start)) {
      start = moment();
    }

    return this.getNotesByTime(start.format(), end.format()).map(notes => {
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

  getItems(includeArchived: boolean = false): Observable<Note[]> {
    return this.getNotesByTime();
  }

  getSortedItems(): Observable<Note[]> {
    return this.getNotesByTime(moment().subtract(2, 'hours').format());
  }

  getUpcomingItems(): Observable<Note[]> {
    return this.getNotesByTime(moment().format());
  }

  saveItem(id, note): void {
    if (note['id']) {
      delete note['id'];
    }
    this.angularFireStore
      .doc<Note>(`notes/${id}`)
      .update(note);
  }

  addItem(note: Note): void {
    this.notesCollection.add(note);
  }

  getGoal(): Observable<string> {
    let userId = this.authProvider.getUser().uid;
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
        payload: payload
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
