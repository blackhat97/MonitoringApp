import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TimeseriesPage } from './timeseries.page';
import {MatTableModule} from '@angular/material/table';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Angular2CsvModule } from 'angular2-csv';

const routes: Routes = [
  {
    path: '',
    component: TimeseriesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatTableModule,
    NgbModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    Angular2CsvModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TimeseriesPage]
})
export class TimeseriesPageModule {}
