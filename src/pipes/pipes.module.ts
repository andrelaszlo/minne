import { NgModule } from '@angular/core';
import { HumanTimePipe } from './human-time/human-time';
@NgModule({
	declarations: [HumanTimePipe],
	imports: [],
	exports: [HumanTimePipe]
})
export class PipesModule {}
