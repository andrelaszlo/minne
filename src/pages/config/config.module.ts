import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfigPage } from './config';
import { TabImport } from './tab-import';
import { TabSupport } from './tab-support';


@NgModule({
  declarations: [
    ConfigPage,
    TabImport,
    TabSupport,
  ],
  imports: [
    IonicPageModule.forChild(ConfigPage),
  ],
})
export class ConfigPageModule {}
