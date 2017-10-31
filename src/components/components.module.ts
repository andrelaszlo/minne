import { NgModule } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu';
import { AddButtonComponent } from './add-button/add-button';
@NgModule({
	declarations: [
		MainMenuComponent,
		AddButtonComponent
	],
	imports: [],
	exports: [
		MainMenuComponent,
		AddButtonComponent
	]
})
export class ComponentsModule {}
