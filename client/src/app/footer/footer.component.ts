import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  loggedIn: boolean;
  changeLogin = this.loginService.changeLogin;

  constructor(public loginService: LoginService) { }

  ngOnInit() {
    this.loginService.loggedInState.subscribe(state => this.loggedIn = state);
  }

}
