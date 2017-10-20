import { NgModule } from '@angular/core';
import { IonicPageModule, NavParams } from 'ionic-angular';
import { EditPage } from './edit';

@NgModule({
  declarations: [
    EditPage,
  ],
  imports: [
    IonicPageModule.forChild(EditPage),
  ],
})
export class EditPageModule {}
