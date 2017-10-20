import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase'

/**
* Generated class for the EditPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {
  public note: any = {'content': null};
  public key: any;
  
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider) {
      this.note = navParams.get("note");
      this.key = this.note.key;
      delete this.note.key;
    }
    
    saveNote() {
      this.firebaseProvider.saveItem(this.key, this.note);
      this.viewCtrl.dismiss();
    }
    
  }
  