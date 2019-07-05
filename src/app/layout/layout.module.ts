import { LayoutRoutingModule } from './layout-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutComponent } from './layout.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LayoutRoutingModule,
    IonicModule,
    NgbDropdownModule,
  ],
  declarations: [LayoutComponent]
})
export class LayoutModule {}
