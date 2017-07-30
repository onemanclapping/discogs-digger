import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { FeedbackService } from '../feedback/feedback.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  public loggedIn;

  constructor(private _feedbackService: FeedbackService, private _loginService: LoginService) { }

  ngOnInit() {
    this._loginService.loggedInSubject.subscribe(state => this.loggedIn = state.loggedIn);
  }

  logOut() {
    this._loginService.logOut();
  }

  openFeedback() {
    this._feedbackService.openFeedback();
  }
}
