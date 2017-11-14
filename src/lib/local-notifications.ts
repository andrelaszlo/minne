import { Map } from 'rxjs/util/Map';
import { Injectable } from '@angular/core';
import { Item, Platform } from 'ionic-angular';
import { LocalNotifications, ILocalNotification } from '@ionic-native/local-notifications';
import { dictionaryKeys, asArray, mapDictToArray } from './collection-helpers';
import * as moment from 'moment';

@Injectable()
class BrowserNotifications implements LocalNotifications {
    private scheduled: any;
    private triggered: any;
    private notifications: any;
    private callbacks: any;
    private timer: NodeJS.Timer;
    private notificationNumber = 1;

    constructor() {
        console.log("Using browser notifications");
        if (typeof(Notification) == 'undefined') {
            console.log("This browser does not support desktop notification");
        } else if (Notification.prototype.permission !== "denied") {
            Notification.requestPermission();
        }
        this.scheduled = {};
        this.triggered = {};
        this.notifications = {};
        this.callbacks = {};
        this.scheduleNext();
    }

    private getAllAsDict() {
        return {...this.scheduled, ...this.triggered};
    }

    private showNotification(item: ILocalNotification) {
        item = this.ensureId(item);
        Notification.requestPermission().then(result => {
            let options: any = {
                body: item.text
            };
            let notification = new Notification("Event reminder", options);
            this.notifications[item.id] = notification;
            let self = this;
            notification.addEventListener("show", event => self.fireCallback("trigger", item));
            notification.addEventListener("click", event => self.fireCallback("click", item));
        });
    }

    private getUniqueId(): number {
        return this.notificationNumber++;
    }

    private ensureId(item: ILocalNotification): ILocalNotification {
        if (!item.id) {
            item['id'] = this.getUniqueId();
        }
        return item;
    }

    private fireCallback(callbackName: string, notification: ILocalNotification) {
        let callbacks = this.callbacks[callbackName];
        if (!callbacks)
            return;
        for (let [callback, context] of callbacks) {
            callback.apply(context, [notification]);
        }
    }

    private scheduleNext() {
        // Clear any old timer, so this method can be called whenever something changes
        if (this.timer) {
            clearTimeout(this.timer);
        }
        // Find the next upcoming notification and all expired notifications
        let now = moment();
        let earliestDeadline: any = null;
        let all: Array<ILocalNotification> = mapDictToArray(this.scheduled);
        let expired: Array<ILocalNotification>;
        expired = all.filter(item => moment(item.at).isBefore(now));
        earliestDeadline = all.reduce((prev, current) => {
            if (prev == null || current.at < prev.at) {
                return current;
            }
            return prev;
        }, null);
        // Show and remove expired notifications
        for (let item of expired) {
            this.showNotification(item);
            delete this.scheduled[item.id];
            this.triggered[item.id] = item;
        }
        // Schedule the next upcoming notification, if any
        if (earliestDeadline) {
            let timeout = Math.max(0, moment(earliestDeadline.at).diff(now));
            console.debug("Scheduling next wakeup in", timeout);
            let self = this;
            this.timer = setTimeout(function () { self.scheduleNext(); }, timeout);
        } else {
            console.debug("Nothing to schedule");
        }
    }

    /**
     * Schedules a single or multiple notifications
     * @param options {Notification | Array<ILocalNotification>} optional
     */
    schedule(options?: ILocalNotification | Array<ILocalNotification>): void {
        for(let item of asArray(options)) {
            item = this.ensureId(item);
            this.scheduled[item.id] = item;
            this.fireCallback("schedule", item);
        }
        this.scheduleNext();
    }

    /**
     * Updates a previously scheduled notification. Must include the id in the options parameter.
     * @param options {ILocalNotification} optional
     */
    update(options?: ILocalNotification): void {
        let id = options.id;
        if (this.triggered[id]) {
            delete this.triggered[id];
        }
        this.scheduled[id] = options;
        this.fireCallback("update", this.scheduled[id]);
        this.scheduleNext();
    }

    /**
     * Clears single or multiple notifications
     * @param notificationId {any} A single notification id, or an array of notification ids.
     * @returns {Promise<any>} Returns a promise when the notification had been cleared
     */
    clear(notificationId: any): Promise<any> {
        return new Promise((resolve, reject) => {
            for (let id of asArray(notificationId)) {
                let notification = this.notifications[id];
                if (notification) {
                    notification.close();
                    this.fireCallback("clear", notification);
                }
                this.scheduleNext();
            }
            resolve();
        });
    }

    /**
     * Clears all notifications
     * @returns {Promise<any>} Returns a promise when all notifications have cleared
     */
    clearAll(): Promise<any> {
        return this.clear(dictionaryKeys(this.notifications));
    }

    /**
     * Cancels single or multiple notifications
     * @param notificationId {any} A single notification id, or an array of notification ids.
     * @returns {Promise<any>} Returns a promise when the notification is canceled
     */
    cancel(notificationId: any): Promise<any> {
        return new Promise((resolve, reject) => {
            for (let id of asArray(notificationId)) {
                let notification;
                delete this.scheduled[id];
                this.fireCallback("clear", notification);
                this.scheduleNext();
            }
            resolve();
        });
    }

    /**
     * Cancels all notifications
     * @returns {Promise<any>} Returns a promise when all notifications are canceled
     */
    cancelAll(): Promise<any> {
        return this.cancel(dictionaryKeys(this.scheduled));
    }

    /**
     * Checks presence of a notification
     * @param notificationId {number}
     * @returns {Promise<boolean>}
     */
    isPresent(notificationId: number): Promise<boolean> {
        return Promise.resolve(!!this.getAllAsDict[notificationId]);
    }

    /**
     * Checks is a notification is scheduled
     * @param notificationId {number}
     * @returns {Promise<boolean>}
     */
    isScheduled(notificationId: number): Promise<boolean> {
        return Promise.resolve(!!this.scheduled[notificationId]);
    }

    /**
     * Checks if a notification is triggered
     * @param notificationId {number}
     * @returns {Promise<boolean>}
     */
    isTriggered(notificationId: number): Promise<boolean> {
        return Promise.resolve(!!this.triggered[notificationId]);
    }

    /**
     * Get all the notification ids
     * @returns {Promise<Array<number>>}
     */
    getAllIds(): Promise<Array<number>> {
        return Promise.resolve(dictionaryKeys(this.getAllAsDict()));
    }

    /**
     * Get the ids of triggered notifications
     * @returns {Promise<Array<number>>}
     */
    getTriggeredIds(): Promise<Array<number>> {
        return Promise.resolve(dictionaryKeys(this.triggered));
    }

    /**
     * Get the ids of scheduled notifications
     * @returns {Promise<Array<number>>} Returns a promise
     */
    getScheduledIds(): Promise<Array<number>> {
        return Promise.resolve(dictionaryKeys(this.scheduled));
    }

    /**
     * Get a notification object
     * @param notificationId {any} The id of the notification to get
     * @returns {Promise<ILocalNotification>}
     */
    get(notificationId: any): Promise<ILocalNotification> {
        let notification = this.getAllAsDict()[notificationId];
        return notification
            ? Promise.resolve(notification)
            : Promise.reject("Unknown notification id " + notificationId);
    }

    /**
     * Get a scheduled notification object
     * @param notificationId {any} The id of the notification to get
     * @returns {Promise<ILocalNotification>}
     */
    getScheduled(notificationId: any): Promise<ILocalNotification> {
        let notification = this.scheduled[notificationId];
        return notification
            ? Promise.resolve(notification)
            : Promise.reject("Unknown scheduled notification id " + notificationId);
    }

    /**
     * Get a triggered notification object
     * @param notificationId The id of the notification to get
     * @returns {Promise<ILocalNotification>}
     */
    getTriggered(notificationId: any): Promise<ILocalNotification> {
        let notification = this.triggered[notificationId];
        return notification
            ? Promise.resolve(notification)
            : Promise.reject("Unknown triggered notification id " + notificationId);
    }

    /**
     * Get all notification objects
     * @returns {Promise<Array<ILocalNotification>>}
     */
    getAll(): Promise<Array<ILocalNotification>> {
        return Promise.resolve(mapDictToArray(this.getAllAsDict()));
    }

    /**
     * Get all scheduled notification objects
     * @returns {Promise<Array<ILocalNotification>>}
     */
    getAllScheduled(): Promise<Array<ILocalNotification>> {
        return Promise.resolve(mapDictToArray(this.scheduled));
    }

    /**
     * Get all triggered notification objects
     * @returns {Promise<Array<ILocalNotification>>}
     */
    getAllTriggered(): Promise<Array<ILocalNotification>> {
        return Promise.resolve(mapDictToArray(this.triggered));
    }

    /**
     * Register permission to show notifications if not already granted.
     * @returns {Promise<boolean>}
     */
    registerPermission(): Promise<boolean> {
        return Notification.requestPermission()
            .then( result => Promise.resolve(result == 'granted') )
    }

    /**
     * Informs if the app has the permission to show notifications.
     * @returns {Promise<boolean>}
     */
    hasPermission(): Promise<boolean> {
        return Promise.resolve(Notification.prototype.permission !== "denied");
    }

    /**
     * Sets a callback for a specific event
     * @param eventName The name of the event. Available events: schedule, trigger, click, update, clear, clearall, cancel, cancelall
     * @param callback Call back function. All events return notification and state parameter. clear and clearall return state parameter only.
     */
    on(eventName: string, callback: any, scope?: any): void {
        if (!this.callbacks[eventName]) {
            this.callbacks[eventName] = [];
        }
        this.callbacks[eventName].push([callback, scope || window]);
    }

    /**
     * Removes a callback of a specific event
     * @param eventName The name of the event. Available events: schedule, trigger, click, update, clear, clearall, cancel, cancelall
     * @param callback Call back function. All events return notification and state parameter. clear and clearall return state parameter only.
     */
    un(eventName: string, callback: any): void {
        for (let index in this.callbacks) {
            if (this.callbacks[index][0] == callback) {
                this.callbacks.splice(index, 1);
                break;
            }
        }
    }
}

export function localNotificationsFactory(platform: Platform) {
    if (platform.is('cordova')) {
        return new LocalNotifications();
    } else {
        return new BrowserNotifications();
    }
}