import { OffendersRoutingModule } from './offenders-routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { ListComponent } from './list/list.component';
import { AddEditComponent } from './add-edit/add-edit.component';



@NgModule({
  declarations: [LayoutComponent, ListComponent, AddEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OffendersRoutingModule
  ],
})
export class OffenderModule { }
