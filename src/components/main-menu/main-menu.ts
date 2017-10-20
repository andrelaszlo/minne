import { Component, Input } from '@angular/core';
import { AppModule } from '../../app/app.module';

@Component({
  selector: 'main-menu',
  templateUrl: 'main-menu.html'
})
export class MainMenuComponent {

  @Input()
  title: string;
  appName: string = AppModule.applicationName;

  constructor() {
    this.title = '';
  }

}
