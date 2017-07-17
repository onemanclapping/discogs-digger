import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  changeLogin = this.loginService.changeLogin;
  loggedIn: boolean;
  seller: string;
  isInputValid: boolean = false;
  isWorking: boolean = false;

  constructor(public loginService: LoginService, private router: Router) { }

  setSeller(event: KeyboardEvent) { // with type info
    this.seller = (<HTMLInputElement>event.target).value;
    this.isInputValid = !!this.seller;
  }

  fetchData() {
    this.isWorking = true;
    setTimeout(() => this.router.navigate(['/results', this.seller]), 1000)
  }

  cancelFetch() {
    this.isWorking = false;
  }

  ngOnInit() {
    this.loginService.loggedInState.subscribe(state => this.loggedIn = state);
  }

}
