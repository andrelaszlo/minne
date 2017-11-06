import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, ModalController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs';
import { AddPage } from '../../pages/add/add';

@IonicPage()
@Component({
  selector: 'page-goals',
  templateUrl: 'goals.html',
})
export class GoalsPage {

  public items: Observable<any>;
  public limitedItems: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider,
    public modalCtrl: ModalController,
    public authProvider: AuthProvider
  ) {
    this.items = firebaseProvider.getLimitedItems();
  }

  getUserName() {
    return this.authProvider.getUser().displayName.split(" ")[0];
  }

  addNote(fab: FabContainer) {
    fab.close();
    let modal = this.modalCtrl.create(AddPage);
    modal.present();
  }

}
