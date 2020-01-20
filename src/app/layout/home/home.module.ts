import { NgxEchartsModule } from 'ngx-echarts';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import {GaugesModule} from 'ng-canvas-gauges';
import { HomePage } from './home.page';
import { SharedPipesModule } from '../../shared/pipes/shared-pipes.module';
import { SendEmailComponent } from '../components/send-email/send-email.component';
import { NotiModalComponent } from '../components/noti-modal/noti-modal.component';
import { ChannelFilterComponent } from '../components/channel-filter/channel-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GaugesModule,
    ReactiveFormsModule,
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
    ChannelFilterComponent,
    SendEmailComponent
  ],
  entryComponents: [
    NotiModalComponent,
    ChannelFilterComponent,
    SendEmailComponent
  ],
})
export class HomePageModule {}
