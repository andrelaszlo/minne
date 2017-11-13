import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ILocalNotification, LocalNotifications } from '@ionic-native/local-notifications';
import 'rxjs/add/operator/map';
import * as moment from 'moment-timezone';
import { FirebaseProvider, Note } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable, Subject } from 'rxjs';
import { PersistentObject } from '../../lib/collection-helpers';

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
    const EVERY_HOUR = 60000;
    console.log("storage", storage);


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
  private notificationMapping: PersistentObject<Array<any>>;
  
  constructor(
    note: Note,
    notificationProvider: NotificationProvider
  ) {
    this.notificationProvider = notificationProvider;
    this.note = note;
    this.notificationMapping = new PersistentObject<Array<number>>(this.notificationProvider.storage, this.getReferenceString(), () => new Array());
    this.updateNotifications();
  }

  private updateNotifications() {
    let type = 'default'; // TODO see below
    let notifications = this.getNotifications().then(notifications => {
      console.log("Updating or ignoring", notifications);
      let found = false;
      for (let notificationItem of notifications) {
        console.log("Checking existing notification", notificationItem);
        if (notificationItem.type == type) {
          found = true;
        }
      }
      if (!found) {
        console.log("Not found, scheduling new", type, notifications);
        this.addNotification(this.note);
      }
    }).catch(err => console.warn(err));
  }

  private getNotifications(): any {
    /*
    Well... this escalated quickly.

    We need to check if all the stored notifications still exist. We get them from storage,
    which returns a promise. But in the promise we need to loop through all ids and check
    if the notification exists, which returns another promise.
    And in the end we need a promise of an array of all the ids.

    Solution: Make a new observable, get all the notifications, use Promise.all to wait for them
    to finish then use toArray().toPromise().
    */
    let obs: Observable<any> = new Observable(observer => {
      this.notificationMapping.do((notificationIds) => {
        var promises = notificationIds.map(({id, type}) => {
          this.notificationProvider.localNotifications.get(id)
            .then(notification => {
              let item = {id, type};
              observer.next(item)
              return null;
            })
            .catch(err => {
              console.log("Could not get local notification, rescheduling", id, type);
              let item = {id, type};
              this.addNotification(this.note, true, id);
              observer.next(item);
              return null;
            })
        });
        Promise.all(promises).then(results => observer.complete());
      });
    });
    
    return obs.toArray().toPromise();
  }

  private getReferenceString(): string {
    if (!this.note.id) {
      console.log("Unknown note id", this.note);
      throw new Error("Note id unknown");
    }
    return 'notification-mapping-' + this.note.id;
  }

  private addNotificationToMapping(notificationId) {
    let item = {
      id: notificationId,
      type: 'default' // TODO: the plan is to use this to have a name for each type of notification, eg "10 minutes" or "default". Not sure yet.
    };
    this.notificationMapping.do(ids => {
      console.log("Setting", ids, item);
      ids.push(item);
      return ids;
    });
  }

  private getUniqueId(): number {
    return Date.now() * 1000000 + Math.floor((Math.random() * 1000000));
  }

  private addNotification(note: Note, reschedule=false, id:number = null) {
    console.log("add notification", reschedule, id);
    let notificationId = id || this.getUniqueId();
    this.notificationProvider.localNotifications.schedule({
      id: notificationId,
      at: moment(note.date).subtract(10, 'minutes').toDate(),
      text: note.content,
    });
    if (!reschedule) {
      this.addNotificationToMapping(notificationId);
    }
  }
}

