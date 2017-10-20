import { Component, Input } from '@angular/core';

@Component({
  selector: 'main-menu',
  templateUrl: 'main-menu.html'
})
export class MainMenuComponent {

  @Input()
  title: string;

  constructor() {
    this.title = '';
  }

}
