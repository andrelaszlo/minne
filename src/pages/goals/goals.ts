import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, ModalController, AlertController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment-timezone';
import { AddPage } from '../../pages/add/add';
import { EditPage } from '../edit/edit';

@IonicPage({
  name: 'goals',
  priority: 'high'
})
@Component({
  selector: 'page-goals',
  templateUrl: 'goals.html',
})
export class GoalsPage {

  public goal: string;
  public items: any = {};
  public limitedItems: Observable<any>;
  public freeHours: number;
  public days: any[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public modalCtrl: ModalController,
    public authProvider: AuthProvider,
    public alertCtrl: AlertController
  ) {
    this.days = this.getDays();
    firebaseProvider.getSortedItems().forEach(items => {
      var result = {};
      for (let item of items) {
        let date = moment(item.date).startOf('day');
        let key = date.format();
        if (!result[key]) {
          result[key] = {items: [], date: date};
        }
        result[key].items.push(item);
      }
      for (let key in result) {
        let item = result[key];
        item['hours'] = this.getFreeHours(item); //this.firebaseProvider.getFreeHours(item.date)
      }

      let todayKey = moment().startOf('day').format();
      if (result[todayKey]) {
        this.freeHours = result[todayKey]['hours'];
      } else {
        this.freeHours = 10;
      }

      this.items = result;
    });
    firebaseProvider.getUserField('goal').forEach(newGoal => this.goal = newGoal);
  }

  setGoal(goal) {
    this.firebaseProvider.setUserField('goal', goal);
  }

  getUserName() {
    let user = this.authProvider.getUser(false);
    if (!user) {
      return "";
    }
    let displayname = user.displayName || "";
    return displayname.split(" ")[0];
  }

  getTime(date: Date) {
    return moment(date).format('LT');
  }

  showEditNote(note) {
    let modal = this.modalCtrl.create(EditPage, { note });
    modal.present();
  }

  archive(note) {
    this.firebaseProvider.archive(note.id, note);
  }

  delete(note) {
    const alert = this.alertCtrl.create({
      title: 'Confirm deletion',
      message: 'Do you want to delete this note?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.firebaseProvider.delete(note);
          }
        }
      ]
    });
    alert.present();
  }

  addNote(fab: FabContainer) {
    fab.close();
    let modal = this.modalCtrl.create(AddPage);
    modal.present();
  }

  addNewNote(day) {
    let modal = this.modalCtrl.create(AddPage, {
      startDay: day
    });
    modal.present();
  }

  isPast(when: any) {
    return moment(when).isBefore(moment());
  }

  getDays() {
    var days = [];
    var now = moment().startOf('day');
    var lastDate = moment().add(1, 'year').startOf('day');
    while (now.isSame(lastDate) || now.isBefore(lastDate)) {
      days.push(now.clone().format());
      now.add(1, 'day');
    }
    return days;
  }

  toggleTodo(event, note) {
    let toggleState = event.target.checked;
    this.firebaseProvider.toggleCheck(note.id, note, toggleState);
  }

  getFreeHours(day: any): number {
    let date = day.date;
    let start = moment(date).startOf('day').add(8, 'hours');
    let end = moment(date).startOf('day').add(18, 'hours');

    // Start from now if it is today after the start of the day
    if (moment().isAfter(start) && moment().isSame(start, 'day')) {
      start = moment();
    }

    let totalHours = end.diff(start, 'hours');
    for (let note of day.items) {
      if (!note.isEvent) {
        continue;
      }
      let startDate = moment(note['date']);
      let endDate = moment(note['endDate']);
      let itemDuration = endDate.diff(startDate, 'hours');
      totalHours = totalHours - itemDuration;
    }
    return Math.max(0, totalHours);
  }
}
