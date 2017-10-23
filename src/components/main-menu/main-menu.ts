import { Component, Input } from '@angular/core';
import { ConfigProvider } from '../../providers/config/config';

@Component({
  selector: 'main-menu',
  templateUrl: 'main-menu.html'
})
export class MainMenuComponent {

  @Input()
  title: string;
  appName: string;

  constructor(configProvider: ConfigProvider) {
    this.title = '';
    this.appName = configProvider.applicationName;
  }

}
