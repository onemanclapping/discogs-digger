import { Component, OnInit } from '@angular/core';
import { FeedbackService } from './feedback.service';
import { GAService } from '../ga.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  public comment = '';
  public contact = '';
  public isFeedbackOpen = false;

  constructor(private _feedbackService: FeedbackService, private _gaService: GAService) { }

  ngOnInit() {
    this._feedbackService.openFeedbackSubject.subscribe(() => this.isFeedbackOpen = true);
  }

  submit() {
    if (this.comment) {
      this._gaService.sendEvent('core', 'feedback', `${this.contact}: ${this.comment}`);
      this.close();
    }
  }
  
  close() {
    this.comment = '';
    this.contact = '';
    this.isFeedbackOpen = false;
  }
}
