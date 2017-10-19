import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { AngularFireList, AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

 
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
    public angularFireDatabase: AngularFireDatabase) {
    this.items = firebaseProvider.getItems();
  }

  ionViewDidLoad() {
    console.log("items", this.items);
    console.log('ionViewDidLoad InboxPage');
  }

}
