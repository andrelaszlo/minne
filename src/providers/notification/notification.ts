import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import 'rxjs/add/operator/map';
import * as moment from 'moment-timezone';

@Injectable()
export class NotificationProvider {

  private uniqueId: number = 0;

  constructor(
    storage: Storage,
    public localNotifications: LocalNotifications
  ) {
    const EVERY_HOUR = 1000*60*60;

    this.localNotifications.on("trigger", (notification) => console.log("*** Notification triggered", notification));
    this.localNotifications.on("schedule", (notification) => console.log("*** Notification scheduled", notification));
    this.localNotifications.on("click", (notification) => console.log("*** Notification clicked", notification));
    this.localNotifications.on("clear", (notification) => console.log("*** Notification cleared", notification));
    this.localNotifications.on("click", (notification) => this.localNotifications.clear(notification.id));


    this.refreshNotifications();
    setInterval(() => this.refreshNotifications(), EVERY_HOUR);

  }

  private getUniqueId(): number {
    return ++this.uniqueId;
  }

  private refreshNotifications() {
    console.log("Refereshing notifications");
    // Get current notifications from local storage
    let currentNotifications = this.getNotificationsFromStorage();
    for(let note of currentNotifications) {
      this.localNotifications.schedule({
        id: this.getUniqueId(),
        at: moment(note.date).toDate(),
        text: note.content
      });
    }
    // Get all events for next 7 days
    let upcomingEvents = this.getUpcomingEvents();
    // Add any new notifications
    // Refresh regularly
  }

  private getNotificationsFromStorage() {
    return [
      /*
      {
        content: 'already 1',
        date: moment().subtract(10, 'seconds')
      },
      {
        content: 'already 2',
        date: moment().subtract(1, 'years')
      },
      {
        content: '5 seconds',
        date: moment().add(5, 'seconds')
      },
      {
        content: '10 seconds',
        date: moment().add(10, 'seconds').format()
      },
      {
        content: '15 seconds',
        date: moment().add(15, 'seconds').format()
      }
      */
    ]
  }

  private getUpcomingEvents() {

  }

  public addNotification(note: any) {

  }

}
