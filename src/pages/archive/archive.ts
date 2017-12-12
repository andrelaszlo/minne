import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, FabContainer } from 'ionic-angular';

import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { EditPage } from '../edit/edit';

@IonicPage({
  name: 'archive'
})
@Component({
  selector: 'page-archive',
  templateUrl: 'archive.html',
})
export class ArchivePage {

  public items: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public angularFireDatabase: AngularFireDatabase,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) {
    this.items = firebaseProvider.getArchivedItems();
  }

  showEditNote(note) {
    let modal = this.modalCtrl.create(EditPage, { note });
    modal.present();
  }

  unarchive(note) {
    this.firebaseProvider.unarchive(note.id, note);
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

  toggleTodo(event, note) {
    let toggleState = event.target.checked;
    this.firebaseProvider.toggleCheck(note.id, note, toggleState);
  }

}
