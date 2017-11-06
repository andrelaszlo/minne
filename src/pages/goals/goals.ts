import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AuthProvider } from '../../providers/auth/auth';
import { Observable } from 'rxjs';
import { AddPage } from '../../pages/add/add';
import { CalendarPage } from '../../pages/calendar/calendar';

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
    public authProvider: AuthProvider
  ) {
    this.items = firebaseProvider.getLimitedItems();
  }

  getUserName() {
    return this.authProvider.getUser().displayName.split(" ")[0];
  }

  getGoal() {
    return this.firebaseProvider.getGoal();
  }

  saveGoal(goal) {
    this.firebaseProvider.addGoal(goal);
  }

  addNote() {
    let modal = this.modalCtrl.create(AddPage);
    modal.present();
  }

  calendarRedirect() {
    this.navCtrl.setRoot(CalendarPage,{});
  }

}
