import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { AddPage } from '../add/add'
import { EditPage } from '../edit/edit'
 
/**
 * Generated class for the InboxPage page.s
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {

  public items: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseProvider: FirebaseProvider,
    public angularFireDatabase: AngularFireDatabase, public modalCtrl: ModalController) {
    this.items = firebaseProvider.getItems();
  }

  ionViewDidLoad() {
    console.log("items", this.items.forEach(
      value => console.log("item", value)
    ));
    console.log('ionViewDidLoad InboxPage');
  }

  presentModal(noteId: string) {
    console.log("nodeId", noteId);
    let modal = this.modalCtrl.create(EditPage, { noteId: noteId });
    modal.present();
  }

}
