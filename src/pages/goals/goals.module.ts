import { PipesModule } from '../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoalsPage } from './goals';

@NgModule({
  declarations: [
    GoalsPage,
  ],
  imports: [
    IonicPageModule.forChild(GoalsPage),
    PipesModule,
  ],
})
export class GoalsPageModule {}
