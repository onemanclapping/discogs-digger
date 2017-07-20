import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ResultsComponent } from './results.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild([
      { path: ':sellerId', component: ResultsComponent }
    ])
  ],
  declarations: [ResultsComponent]
})
export class ResultsModule { }
