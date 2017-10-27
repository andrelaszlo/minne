import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, FabContainer } from 'ionic-angular';

import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { AddPage } from '../add/add'
import { EditPage } from '../edit/edit'

export enum NoteType {
  text,
  voice,
  camera,
  photo,
  drawing
}

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {
  
  public items: Observable<any>;
  public NoteType = NoteType;
  
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

  addNote(noteType: NoteType, fab: FabContainer) {
    switch(noteType) {
      case NoteType.text:
      fab.close();
      this.showAddNote();
      break;
      default:
      let alert = this.alertCtrl.create({
        title: 'Sorry!',
        subTitle: 'This is not implemented yet 😢 Please let us know if you think we should make it a priority.',
        buttons: ['OK']
      });
      alert.present();
    }
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

  private showAddNote() {
    let modal = this.modalCtrl.create(AddPage);
    modal.present();
  }
  
}
