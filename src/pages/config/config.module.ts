import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfigPage } from './config';
import { TabImport } from './tab-import';
import { TabFeedback } from './tab-feedback';


@NgModule({
  declarations: [
    ConfigPage,
    TabImport,
    TabFeedback
  ],
  imports: [
    IonicPageModule.forChild(ConfigPage),
  ],
})
export class ConfigPageModule {}
