import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, ModalController, AlertController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/groupBy'
import * as moment from 'moment-timezone';
import { AddPage } from '../../pages/add/add';
import { EditPage } from '../edit/edit';

@IonicPage()
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
  }

  getTime(value: Date) {
    return moment(value).format('HH:mm');
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

  private getDayName(note) {
    return moment(note.date).format('dddd, MMM D');
  }

}
