import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class FeedbackService {
  public openFeedbackSubject = new Subject();
  
  constructor() { }

  openFeedback() {
    this.openFeedbackSubject.next();
  }
}
