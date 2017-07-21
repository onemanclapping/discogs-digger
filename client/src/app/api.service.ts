import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { HttpClient } from '@angular/common/http';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  private sellerCache = {};
  private buyerCache = {};

  constructor(private http: HttpClient) { }

  fetchBuyer(buyer) {
    if (this.buyerCache[buyer]) return this.buyerCache[buyer];

    const fetch = new BehaviorSubject(<any>{
      progress: 0
    });
    this.buyerCache[buyer] = fetch;
    
    const buyerStateSubscription = this.buyerState(buyer).subscribe(res => {
      fetch.next(res);
    });

    this.http.get(`/api/buyer/${buyer}`).subscribe(res => {
      buyerStateSubscription.unsubscribe();
      fetch.next({
        progress: 100,
        result: res
      });
    });

    return fetch;
  }

  fetchSeller(seller) {
    if (this!.sellerCache[seller]) return this.sellerCache[seller];

    const fetch = new BehaviorSubject(<any>{
      progress: 0
    });
    this.sellerCache[seller] = fetch;

    const sellerStateSubscription = this.sellerState(seller).subscribe(res => {
      fetch.next(res);
    });

    this.http.get(`/api/seller/${seller}`).subscribe(res => {
      sellerStateSubscription.unsubscribe();
      fetch.next({
        progress: 100,
        result: res
      });
    });
    
    return fetch;
  }

  fetchBuyerAndSeller(buyer, seller) {
    const state: any = {
      buyer: {
        progress: 0
      },
      seller: {
        progress: 0
      }
    };
    const fetch = new BehaviorSubject(state);

    this.fetchBuyer(buyer).subscribe(res => {
      
      state.buyer.progress = res.progress;

      if (res.result) {
        state.buyer.result = res.result;

        this.fetchSeller(seller).subscribe(res => {

          state.seller.progress = res.progress;
          
          if (res.result) {
            state.seller.result = res.result;
          }
          fetch.next(state);
        });
      }
      fetch.next(state);
    });

    return fetch;
  }

  buyerState(buyer) {
    return IntervalObservable.create(1000)
      .flatMap(() => {
        return this.http.get(`/api/status/buyer/${buyer}`)
      }).map((res) => {
        return {progress: res}
      });
  }

  sellerState(seller) {
    return IntervalObservable.create(1000)
      .flatMap(() => {
        return this.http.get(`/api/status/seller/${seller}`)
      }).map((res) => {
        return {progress: res}
      });
  }

  getIdentity() {
    return this.http.get('/api/identity');
  }
}
