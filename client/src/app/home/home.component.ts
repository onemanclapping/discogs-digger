import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/concat';


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
  buyerProgressValue: Number = 0;
  sellerProgressValue: Number = 0;


  constructor(private loginService: LoginService, private router: Router, private apiService: ApiService) { }

  setSeller(event: KeyboardEvent) { // with type info
    this.seller = (<HTMLInputElement>event.target).value;
    this.isInputValid = !!this.seller;
  }

  fetchData() {
    this.isWorking = true;

    this.apiService.fetchBuyer('onemanclap').subscribe(() => {
      
      this.apiService.fetchSeller(this.seller).subscribe(() => {
        this.router.navigate(['/results', this.seller]);
      });

      this.apiService.sellerState('onemanclap').subscribe((state: any) => {
        this.sellerProgressValue = Math.floor(state.value/state.max*100);
      });
    });
    this.apiService.buyerState('onemanclap').subscribe((state: any) => {
      this.buyerProgressValue = Math.floor(state.value/state.max*100);
    });
    
  }

  cancelFetch() {
    this.isWorking = false;
  }

  ngOnInit() {
    this.loginService.loggedInState.subscribe(state => this.loggedIn = state);
  }

}
