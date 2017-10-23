import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Observable } from 'rxjs';

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
    public firebaseProvider: FirebaseProvider
  ) {
    this.items = firebaseProvider.getSortedItems();
  }

}
