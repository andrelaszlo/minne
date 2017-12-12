import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabImport } from './tab-import';
import { TabFeedback } from './tab-feedback';


@IonicPage({
  name: 'config',
  defaultHistory: ['goals']
})
@Component({
  selector: 'page-config',
  templateUrl: 'config.html',
})
export class ConfigPage {

  tabImport = TabImport;
  tabFeedback = TabFeedback;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

}
