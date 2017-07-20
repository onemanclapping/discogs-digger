import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-progress-overlay',
  templateUrl: './progress-overlay.component.html',
  styleUrls: ['./progress-overlay.component.css']
})
export class ProgressOverlayComponent {
  @Input() buyerProgressValue: Number;
  @Input() sellerProgressValue: Number;
  @Input() sellerName: String;
  @Output() onCancel: EventEmitter<any> = new EventEmitter();

  onCancelClick() {
    this.onCancel.emit();
  }
}
