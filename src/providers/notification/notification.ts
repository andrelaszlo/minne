import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';
import 'rxjs/add/operator/map';
import * as moment from 'moment-timezone';

@Injectable()
export class NotificationProvider {

  constructor(
    storage: Storage,
    public localNotifications: LocalNotifications
  ) {
    const EVERY_HOUR = 1000*60*60;
    this.refreshNotifications();
    setInterval(() => this.refreshNotifications(), EVERY_HOUR);
  }

  private refreshNotifications() {
    console.log("Refereshing notifications");
    // Get current notifications from local storage
    let currentNotifications = this.getNotificationsFromStorage();
    for(let note of currentNotifications) {
      this.localNotifications.schedule({
        id: 1,
        at: note.date,
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
      {
        content: 'hello',
        date: moment().add(10, 'seconds')
      }
    ]
  }

  private getUpcomingEvents() {

  }

  public addNotification(note: any) {

  }

}
