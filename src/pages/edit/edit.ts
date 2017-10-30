import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase'

@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {
  public note: any = {'content': null};
  public id: string = null;
  
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public firebaseProvider: FirebaseProvider) {
      this.note = navParams.get("note");
      this.id = this.note.id;
    }
    
    saveNote() {
      this.firebaseProvider.saveItem(this.note.id, this.note);
      this.viewCtrl.dismiss();
    }
    
  }
  