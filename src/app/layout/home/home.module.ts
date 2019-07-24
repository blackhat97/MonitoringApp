import { NgxEchartsModule } from 'ngx-echarts';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import {GaugesModule} from 'ng-canvas-gauges';
import { HomePage } from './home.page';
import { NotiModalComponent } from '../noti-modal/noti-modal.component';
import { SharedPipesModule } from '../../shared/pipes/shared-pipes.module';
import { ChannelFilterComponent } from '../channel-filter/channel-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GaugesModule,
    SharedPipesModule,
    NgxEchartsModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [
    HomePage,
    NotiModalComponent,
    ChannelFilterComponent
  ],
  entryComponents: [
    NotiModalComponent,
    ChannelFilterComponent
  ],
})
export class HomePageModule {}
