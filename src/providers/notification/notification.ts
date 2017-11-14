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
    const EVERY_HOUR = 1000*60*60;

    this.localNotifications.on("trigger", (notification) => console.log("*** Notification triggered", notification));
    this.localNotifications.on("schedule", (notification) => console.log("*** Notification scheduled", notification));
    this.localNotifications.on("click", (notification) => console.log("*** Notification clicked", notification));
    this.localNotifications.on("clear", (notification) => console.log("*** Notification cleared", notification));
    this.localNotifications.on("click", (notification) => this.localNotifications.clear(notification.id));

    this.authProvider.getUserPromise().then( user => {
      this.refreshNotifications();
      setInterval(() => this.refreshNotifications(), EVERY_HOUR);
      this.getUpcomingEvents().forEach(items => {
        console.log("Events updated", items);
        this.refreshNotificationItems(items);
      });
    });
  }

  public refreshNotifications() {
    console.log("Refereshing notifications");
    this.getUpcomingEvents().take(1).forEach(items => this.refreshNotificationItems(items));
  }

  private refreshNotificationItems(items: any) {
    console.log("Checking notifications for upcoming events", items);
    this.localNotifications.cancelAll();      
    for (let item of items) {
      new StoredNotification(item, this);
    }
  }

  private getUpcomingEvents(): Observable<Note[]> {
    return this.firebaseProvider.getUpcomingItems();
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
    let referenceString = 'notification-mapping-' + this.note.id;
    this.notificationMapping = new PersistentObject<Array<number>>(this.notificationProvider.storage, referenceString, () => new Array());
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
      this.notificationMapping.get((notificationIds) => {
        var promises = notificationIds.map(({id, type}) => {
          let item = {id, type};
          this.notificationProvider.localNotifications.get(id)
            .then(notification => observer.next(item))
            .catch(err => {
              console.log("Could not get local notification, rescheduling", id, type);
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

  private addNotificationToMapping(notificationId) {
    let item = {
      id: notificationId,
      type: 'default' // TODO: the plan is to use this to have a name for each type of notification, eg "10 minutes" or "default". Not sure yet.
    };
    this.notificationMapping.update(ids => {
      ids.push(item);
      return ids;
    });
  }

  private getUniqueId(): number {
    return Date.now() * 1000000 + Math.floor((Math.random() * 1000000));
  }

  private addNotification(note: Note, reschedule=false, id:number = null) {
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

