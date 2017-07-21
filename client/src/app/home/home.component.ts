import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/concat';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedIn: boolean;
  seller: string;
  isInputValid: boolean = false;
  isWorking: boolean = false;
  buyerProgressValue: Number = 0;
  sellerProgressValue: Number = 0;

  private currentFetch: Subscription;


  constructor(private loginService: LoginService, private router: Router, private apiService: ApiService) { }

  setSeller(event: KeyboardEvent) {
    this.seller = (<HTMLInputElement>event.target).value;
    this.isInputValid = !!this.seller;

    if (this.isInputValid && event.keyCode == 13) {
      this.fetchData();
    }
  }

  fetchData() {
    this.isWorking = true;

    this.currentFetch = this.apiService.fetchBuyerAndSeller('onemanclap', this.seller).subscribe(res => {
      this.buyerProgressValue = res.buyer.progress;
      this.sellerProgressValue = res.seller.progress;
      
      if (this.buyerProgressValue === 100 && this.sellerProgressValue === 100) {
        this.router.navigate(['/results', this.seller]);
      }
    });    
  }

  cancelFetch() {
    this.isWorking = false;
    this.currentFetch.unsubscribe();
  }

  ngOnInit() {
    this.loginService.loggedInState.subscribe(state => this.loggedIn = state);
  }

  login() {
    window.location.href = '/api/authorize';
  }

}
