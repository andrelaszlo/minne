import { Component } from '@angular/core';
import { ModalController, FabContainer, AlertController } from 'ionic-angular';
import { AddPage } from '../../pages/add/add'

export enum NoteType {
  text,
  voice,
  camera,
  photo,
  drawing
}

@Component({
  selector: 'add-button',
  templateUrl: 'add-button.html'
})
export class AddButtonComponent {
  public NoteType = NoteType;

  constructor(
    public modalCtrl: ModalController,
    public alertCtrl: AlertController    
  ) {}

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

  private showAddNote() {
    let modal = this.modalCtrl.create(AddPage);
    modal.present();
  }
}
