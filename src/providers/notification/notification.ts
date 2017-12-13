import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ILocalNotification, LocalNotifications } from '@ionic-native/local-notifications';
import * as moment from 'moment-timezone';
import { FirebaseProvider, Note } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs/Observable';
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
    // TODO: Fix the bugs in this module and re-enable :P
    /*
    const EVERY_HOUR = 1000*60*60;

    this.localNotifications.on("schedule", (notification) => console.log("*** Notification scheduled", notification));
    this.localNotifications.on("click", (notification) => console.log("*** Notification clicked", notification));
    this.localNotifications.on("clear", (notification) => console.log("*** Notification cleared", notification));
    this.localNotifications.on("click", (notification) => {
      console.log("*** Notification clicked", notification);
      this.localNotifications.clear(notification.id);
    });
    this.localNotifications.on("trigger", (notification) => {
      console.log("*** Notification triggered", notification);

      this.setTriggered(notification.data.noteId, notification.data.type, notification.data.timestamp);
    });

    this.authProvider.getUserPromise().then( user => {
      setInterval(() => this.refreshNotifications(), EVERY_HOUR);
      this.getUpcomingEvents().forEach(items => {
        this.refreshNotificationItems(items);
      });
    }).catch(err => console.log("Error while getting user promise", err));
    */
  }

  private setTriggered(noteId: string, configType: string, timestamp: number): Promise<boolean> {
    console.log("Setting notification as triggered", noteId, configType, timestamp);
    return new PersistentObject<boolean>(
      this.storage,
      `note-triggered-${noteId}-${configType}-${timestamp}`,
      () => false
    ).update(prev => true);
  }

  public refreshNotifications() {
    this.getUpcomingEvents().take(1).forEach(items => this.refreshNotificationItems(items));
  }

  private refreshNotificationItems(items: any) {
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

  private getNotificationDateForConfig(config: any): Date {
    return moment(this.note.date).subtract(10, 'minutes').toDate();
  }

  private updateNotifications() {
    let config = {
      name: 'default'
    }; // TODO see below
    this.getNotifications().then(notifications => {
      let found = false;
      let expiredNotifications = [];
      let expectedTime = this.getNotificationDateForConfig(config);
      for (let notificationItem of notifications) {
        if (notificationItem.type == config.name) {
          if (notificationItem.notification) {
            let notification = notificationItem.notification;
            // Notification already exists
            found = true;
            console.log("Found existing notification", this.note.id, notificationItem.id);
            // Refresh notification if necessary
            if (notification.timestamp != expectedTime.getTime()) {
              // Wrong time for this configuration, reschedule
              console.log("Updating time for", expectedTime);
              this.updateNotification(expectedTime, notificationItem.id);
            }
          } else if (!notificationItem.notification) {
            // Add missing notification
            found = true;
            console.log("Notification missing, rescheduling", this.note.id);
            this.addNotification(expectedTime, true);
          } else if (notificationItem.timestamp < moment().toDate().getTime()) {
            // Remove old notification
            console.log("Removing old notification", notificationItem);
            this.removeNotificationFromMapping(notificationItem.id);
          }
        }
      }
      if (!found) {
        console.log("Scheduling new notification", this.note.id);
        this.addNotification(expectedTime);
      }
    }).catch(err => console.warn(err));
  }

  private removeNotificationFromMapping(notificationId) {
    this.notificationMapping.update(notifications => {
      for (let index in notifications) {
        if (notifications[index].id == notificationId) {
          notifications.splice(index, 1);
        }
        return notifications;
      }
    });
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
      this.notificationMapping.get((notifications) => {
        var promises = notifications.map(({id, type}) => {
          let item = {id, type, notification: null};
          this.notificationProvider.localNotifications.get(id)
            .then(notification => {
              item.notification = notification;
              observer.next(item);
            })
            .catch(err => {
              observer.next(item);
            })
        });
        Promise.all(promises)
          .then(results => observer.complete())
          .catch(err => console.log("Error while getting notifications", err));
      });
    });

    return obs.toArray().toPromise();
  }

  private isTriggered(configType: string, timestamp: number): Promise<boolean> {
    return new PersistentObject<boolean>(
      this.notificationProvider.storage,
      `note-triggered-${this.note.id}-${configType}-${timestamp}`,
      () => false
    ).asPromise();
  }

  private addNotificationToMapping(notificationId: number, timestamp: number) {
    let item = {
      id: notificationId,
      timestamp: timestamp,
      noteId: this.note.id,
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

  private addNotification(dateTime: Date, reAdd=false): void {
    this.isTriggered('default', dateTime.getTime())
      .then(isTriggered => {
        if (isTriggered) {
          console.log("Not adding new notification for already triggered alert", this.note.id, 'default', dateTime.getTime());
          return;
        }
        let notificationId = this.getUniqueId();
        this.notificationProvider.localNotifications.schedule({
          id: notificationId,
          at: dateTime,
          text: this.note.content,
          data: {
            noteId: this.note.id,
            type: 'default',
            timestamp: dateTime.getTime()
          },
        });
        if (!reAdd) {
          this.addNotificationToMapping(notificationId, dateTime.getTime());
        }
      })
      .catch(err => console.log("Error while adding notification", err));
  }

  private updateNotification(dateTime: Date, id:number): void {
    this.notificationProvider.localNotifications.update({
      id: id,
      at: dateTime,
      text: this.note.content,
      data: {
        noteId: this.note.id,
        type: 'default',
        timestamp: dateTime.getTime()
      }
    });
  }
}

