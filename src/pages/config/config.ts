import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabImport } from './tab-import';


@IonicPage({
  name: 'config',
  defaultHistory: ['goals']
})
@Component({
  selector: 'page-config',
  templateUrl: 'config.html',
})
export class ConfigPage {

  tabImport: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.tabImport = TabImport;
  }

}
