import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabImport } from './tab-import';
import { TabFeedback } from './tab-feedback';
import { TabSupport } from './tab-support';

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
  tabSupport = TabSupport;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

}
