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
        let key = moment(item.date).startOf('day').format();
        if (!result[key]) {
          result[key] = {items: [], hours: this.firebaseProvider.getFreeHours(item.date)};
        }
        result[key].items.push(item);
      }
      this.items = result;
    });
    firebaseProvider.getGoal().forEach(newGoal =>  this.goal = newGoal);
    this.firebaseProvider.getFreeHours().forEach(hours => this.freeHours = hours)
      .catch(error => console.log("Error getting number of free hours", error));
  }

  setGoal(goal) {
    this.firebaseProvider.addGoal(goal);
  }

  getUserName() {
    return this.authProvider.getUser().displayName.split(" ")[0];
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
}
