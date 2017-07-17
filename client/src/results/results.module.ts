import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { ResultsComponent }   from './results.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: ':sellerId', component: ResultsComponent }
    ])
  ],
  declarations: [ResultsComponent]
})
export class ResultsModule { }
