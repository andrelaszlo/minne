import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, FabContainer } from 'ionic-angular';

import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { EditPage } from '../edit/edit'
import { AddPage } from '../../pages/add/add'

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {
  
  public items: Observable<any>;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public angularFireDatabase: AngularFireDatabase,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) {
    this.items = firebaseProvider.getItems();
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
  
}
