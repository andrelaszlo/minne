import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, ModalController, AlertController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment-timezone';
import { AddPage } from '../../pages/add/add';
import { EditPage } from '../edit/edit';

@IonicPage({
  name: 'calendar'
})
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {

  public items: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) {
    this.items = firebaseProvider.getEvents().map(items => {
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
  }

  getTime(date: Date, fullDay: boolean) {
    if (fullDay) {
      return moment(date).calendar(null, {
        lastDay: 'Do',
        lastWeek: 'Do',
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'Do',
        // TODO: adapt to location
        sameElse: function(now) {
          return this.isBefore(now.endOf("year")) ? 'Do' : 'MM/DD';
        }
      });
    }
    return moment(date)
      .calendar(null, {
        lastDay: 'Do LT',
        lastWeek: 'Do LT',
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
        lastDay: 'MMMM',
        lastWeek: 'MMMM',
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
