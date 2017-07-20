import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ApiService {
  private sellerCache = {};
  private buyerCache = {};

  constructor() { }

  fetchBuyer(buyer) {
    if (this.buyerCache[buyer]) return this.buyerCache[buyer];

    const fetch = new BehaviorSubject(<any>{
      progress: 0,
      result: undefined
    });
    this.buyerCache[buyer] = fetch;
    
    this.buyerState(buyer).subscribe(res => {
      fetch.next(res);
    });
    
    setTimeout(() => fetch.next({
      progress: 100,
      result: ['James', 'Depeche Mode']
    }), 5000);

    return fetch;
  }

  fetchSeller(seller) {
    if (this!.sellerCache[seller]) return this.sellerCache[seller];

    const fetch = new BehaviorSubject(<any>{
      progress: 0
    });
    this.sellerCache[seller] = fetch;

    this.sellerState(seller).subscribe(res => {
      fetch.next(res);
    });
    
    setTimeout(() => fetch.next({
      progress: 100,
      result: [{
        artist: "Pink Floyd",
        condition: "Near Mint (NM or M-)",
        currency: "EUR",
        media: ["LP", '12"'],
        price: 45,
        releaseId: 3958614,
        title: "Meddle (LP, Album, Club, RE)",
        uri: "https://www.discogs.com/sell/item/190248021"
      }, {
        artist: "James",
        condition: "Near Mint (NM or M-)",
        currency: "EUR",
        media: ["LP", '12"'],
        price: 45,
        releaseId: 3958614,
        title: "Wah Wah",
        uri: "https://www.discogs.com/sell/item/190248021"
      }, {
        artist: "Depeche Mode",
        condition: "Near Mint (NM or M-)",
        currency: "EUR",
        media: ["LP", '12"'],
        price: 45,
        releaseId: 3958614,
        title: "Violator",
        uri: "https://www.discogs.com/sell/item/190248021"
      }]
    }), 5000);
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
    const fetch = new Subject();
    setTimeout(() => fetch.next({progress: 10}), 1000);
    setTimeout(() => fetch.next({progress: 30}), 2000);
    setTimeout(() => fetch.next({progress: 50}), 3000);
    setTimeout(() => fetch.next({progress: 70}), 4000);
    return fetch;
  }

  sellerState(buyer) {
    const fetch = new Subject();
    setTimeout(() => fetch.next({progress: 10}), 1000);
    setTimeout(() => fetch.next({progress: 30}), 2000);
    setTimeout(() => fetch.next({progress: 50}), 3000);
    setTimeout(() => fetch.next({progress: 70}), 4000);
    return fetch;
  }
}
