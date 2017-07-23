import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ProgressOverlayService {
  public cancelCallbackChanged = new Subject();
  
  constructor() { }

  setCancelCallback(cb) {
    this.cancelCallbackChanged.next(cb);
  }
}
