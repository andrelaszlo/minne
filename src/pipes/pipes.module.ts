import { NgModule } from '@angular/core';
import { HumanTimePipe } from './human-time/human-time';
import { FormatToLocalPipe } from './format-to-local/format-to-local';
@NgModule({
	declarations: [HumanTimePipe,
    FormatToLocalPipe],
	imports: [],
	exports: [HumanTimePipe,
    FormatToLocalPipe]
})
export class PipesModule {}
