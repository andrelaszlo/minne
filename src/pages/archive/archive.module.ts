import { ComponentsModule } from '../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ArchivePage } from './archive';

@NgModule({
  declarations: [
    ArchivePage,
  ],
  imports: [
    IonicPageModule.forChild(ArchivePage),
    ComponentsModule,
  ],
})
export class ArchivePageModule {}
