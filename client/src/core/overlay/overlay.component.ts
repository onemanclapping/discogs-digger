import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent {
  @Output()
  public onOutsideClick = new EventEmitter();

  constructor() { }

  userClickedOutside($event) {
    if ($event.target.classList.contains('center')) {
      this.onOutsideClick.emit();
    }
  }
}
