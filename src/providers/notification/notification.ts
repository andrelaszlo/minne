import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import 'rxjs/add/operator/map';
import * as moment from 'moment-timezone';
import { FirebaseProvider, Note } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs';

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
        this.addNotification(item);
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
