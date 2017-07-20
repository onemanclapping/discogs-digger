import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProgressOverlayComponent } from './progress-overlay/progress-overlay.component';

@NgModule({
  declarations: [
    ProgressOverlayComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [ProgressOverlayComponent]
})
export class CoreModule { }
