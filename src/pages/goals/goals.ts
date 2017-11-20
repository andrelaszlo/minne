import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, ModalController, AlertController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/groupBy'
import * as moment from 'moment-timezone';
import { AddPage } from '../../pages/add/add';
import { EditPage } from '../edit/edit';

@IonicPage()
@Component({
  selector: 'page-goals',
  templateUrl: 'goals.html',
})
export class GoalsPage {

  public goal: string;
  public items: Observable<any>;
  public limitedItems: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public modalCtrl: ModalController,
    public authProvider: AuthProvider,
    public alertCtrl: AlertController
  ) {
    this.items = firebaseProvider.getSortedItems().map(items => {
      var lastGroup = null;
      var result = [];
      var temp = [];
      for (let item of items) {
        var group = this.getDayName(item);
        if (lastGroup == null) {
          lastGroup = group;
          temp.push(item);
        } else if (group != lastGroup) {
          if (temp.length) {
            result.push({'key': lastGroup, 'items': temp});
            temp = [item];
          }
          lastGroup = group;
        } else {
          temp.push(item);
        }
      }
      if (temp.length) {
        result.push({'key': lastGroup, 'items': temp});
      }
      return result;
    });
    firebaseProvider.getGoal().forEach(newGoal =>  this.goal = newGoal);

    firebaseProvider.getFreeHours().then(freeHours => {
      console.log('free hours', freeHours);
    }).catch(error => console.log("Error getting number of free hours", error));
    
  }

  setGoal(goal) {
    this.firebaseProvider.addGoal(goal);
  }

  getUserName() {
    return this.authProvider.getUser().displayName.split(" ")[0];
  }

  saveGoal(goal) {
    this.firebaseProvider.addGoal(goal);
  }

  getTime(date: Date) {
    return moment(date)
    .calendar(null, {
      sameDay: 'LT',
      nextDay: 'LT',
      nextWeek: 'LT',
      // TODO: adapt to location
      sameElse: function(now) {
        return this.isBefore(now.endOf("year")) ? 'Do LT' : 'MM/DD LT';
      }
    });
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

  isPast(when: any) {
    return moment(when).isBefore(moment());
  }

  private getDayName(note) {
    return moment(note.date)
    .calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function(date) {
        let endOfYear = moment().endOf("year");
        if (this.isAfter(endOfYear)) {
          return 'Y';
        }
        return 'MMMM';
      }
    });
  }

}
