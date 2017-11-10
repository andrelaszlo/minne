import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ILocalNotification, LocalNotifications } from '@ionic-native/local-notifications';
import 'rxjs/add/operator/map';
import * as moment from 'moment-timezone';
import { FirebaseProvider, Note } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable, Subject } from 'rxjs';

/*
  TODO
  - Don't show a notification twice, even between restarts.
  - Update when a note is added.
  - Multiple notification times
  - Multiple notification methods
*/

@Injectable()
export class NotificationProvider {

  private uniqueId: number = 0;

  constructor(
    public firebaseProvider: FirebaseProvider,
    public localNotifications: LocalNotifications,
    public storage: Storage,
    private authProvider: AuthProvider
  ) {
    //const EVERY_HOUR = 1000*60*60;
    const EVERY_HOUR = 10000;

    this.localNotifications.on("trigger", (notification) => console.log("*** Notification triggered", notification));
    this.localNotifications.on("schedule", (notification) => console.log("*** Notification scheduled", notification));
    this.localNotifications.on("click", (notification) => console.log("*** Notification clicked", notification));
    this.localNotifications.on("clear", (notification) => console.log("*** Notification cleared", notification));
    this.localNotifications.on("click", (notification) => this.localNotifications.clear(notification.id));

    this.authProvider.getUserPromise().then( user => {
      this.refreshNotifications();
      setInterval(() => this.refreshNotifications(), EVERY_HOUR);
    });
  }

  private getUniqueId(): number {
    return ++this.uniqueId;
  }

  public refreshNotifications() {
    console.log("Refereshing notifications");
    this.localNotifications.cancelAll();
    // Get current notifications from local storage
    let currentNotifications: Promise<number[]> = this.localNotifications.getAllIds();
    // Get all events for next 7 days
    let upcomingEvents = this.getUpcomingEvents();
    upcomingEvents.take(1).forEach((items: any) => {
      console.log("Checking notifications for upcoming events", items);
      // Add any new notifications
      for (let item of items) {
        new StoredNotification(item, this);
        //this.addNotification(item);
      }
    });
  }

  private getUpcomingEvents(): Observable<Note[]> {
    return this.firebaseProvider.getUpcomingItems();
  }

  private addNotification(note: any) {
    let itemId = this.getUniqueId();
    this.localNotifications.schedule({
      id: itemId,
      at: moment(note.date).subtract(10, 'minutes').toDate(),
      text: note.content,
    });
  }

}

class StoredNotification {
  private notificationProvider: NotificationProvider;
  private note: Note;
  private storage: Storage;
  
  constructor(
    note: Note,
    notificationProvider: NotificationProvider
  ) {
    this.notificationProvider = notificationProvider;
    this.storage = notificationProvider.storage;

    this.note = note;
    this.updateNotifications();
  }

  private updateNotifications() {
    let type = 'default'; // TODO see below
    let notifications = this.getNotifications().then(notifications => {
      let found = false;
      for (let notificationItem of notifications) {
        if (notificationItem.type == type) {
          found = true;
        }
      }
      if (!found) {
        this.addNotification(this.note);
      }
    });
  }

  private getNotifications(): Promise<any[]> {
    let subject: Subject<any> = new Subject();
    
    this.notificationMapping()
      .then(notificationIds => {
        notificationIds.forEach(([id, type]) => {
            this.notificationProvider.localNotifications.get(id)
              .then(notification => subject.next({id, notification, type}))
        })
        subject.complete();
      })
    
    subject.forEach(item => console.log("subject item", item));
    return subject.toArray().toPromise();
  }

  private getReferenceString(): string {
    if (!this.note.id) {
      console.log("Unknown note id", this.note);
      throw new Error("Note id unknown");
    }
    return 'notification-mapping-' + this.note.id;
  }

  private notificationMapping(): any {
    return new Promise((resolve, reject) => {
      this.storage
        .get(this.getReferenceString())
        .then(value =>
          resolve(value || []));
    });
  }

  private addNotificationToMapping(notificationId) {
    let item = {
      id: notificationId,
      type: 'default' // TODO: the plan is to use this to have a name for each type of notification, eg "10 minutes" or "default". Not sure yet.
    };
    this.storage.get(this.getReferenceString()).then(list => {
      list = (list || []).push(item)
      this.storage.set(this.getReferenceString(), list);
    });
  }

  private getUniqueId(): number {
    return Date.now() * 1000000 + Math.floor((Math.random() * 1000000));
  }

  private addNotification(note: Note) {
    let notificationId = this.getUniqueId();
    this.notificationProvider.localNotifications.schedule({
      id: notificationId,
      at: moment(note.date).subtract(10, 'minutes').toDate(),
      text: note.content,
    });
    this.addNotificationToMapping(notificationId);
  }
}
