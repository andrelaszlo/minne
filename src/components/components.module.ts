import { NgModule } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [
		MainMenuComponent
	],
	imports: [
		IonicModule,
	],
	exports: [
		MainMenuComponent,
	]
})
export class ComponentsModule {}
