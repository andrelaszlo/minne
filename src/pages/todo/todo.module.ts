import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TodoPage } from './todo';

@NgModule({
  declarations: [
    TodoPage,
  ],
  imports: [
    IonicPageModule.forChild(TodoPage),
    ComponentsModule,
    PipesModule,
  ],
})
export class TodoPageModule {}
