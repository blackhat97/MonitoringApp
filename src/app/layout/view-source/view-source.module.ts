import { Angular2CsvModule } from 'angular2-csv';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCalendarModule } from 'ionic2-calendar';
import { ViewSourceRoutingModule } from './view-source-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewSourcePage } from './view-source.page';
import { StorageComponent } from './components/storage/storage.component';
import { ViewTextComponent } from './components/view-text/view-text.component';
import { TrendComponent } from './components/trend/trend.component';

import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxEchartsModule,
    NgCalendarModule,
    NgbModule,
    ReactiveFormsModule,
    Angular2CsvModule,
    NgxDatatableModule,
    ViewSourceRoutingModule
  ],
  declarations: [
    ViewSourcePage,
    StorageComponent,
    ViewTextComponent,
    TrendComponent
  ]
})
export class ViewSourcePageModule {}
