import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  public loggedIn;

  constructor(private _loginService: LoginService) { }

  ngOnInit() {
    this._loginService.loggedInSubject.subscribe(state => this.loggedIn = state.loggedIn);
  }

  logOut() {
    this._loginService.logOut();
  }
}
