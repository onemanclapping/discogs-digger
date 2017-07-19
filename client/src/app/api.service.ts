import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ApiService {
  private sellerCache = {};
  private buyerCache = {};

  constructor() { }

  fetchBuyer(buyer) {
    if (this.buyerCache[buyer]) return this.buyerCache[buyer];

    const fetch = new Subject();
    this.buyerCache[buyer] = fetch;
    
    setTimeout(() => fetch.next(['James', 'Depeche Mode']), 5000);
    return fetch;
  }

  fetchSeller(seller) {
    if (this.sellerCache[seller]) return this.sellerCache[seller];

    const fetch = new Subject();
    this.sellerCache[seller] = fetch;
    
    setTimeout(() => fetch.next([{
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
    }]), 5000);
    return fetch;
  }

  buyerState(buyer) {
    const fetch = new Subject();
    setTimeout(() => fetch.next({value: 1, max: 5}), 1000);
    setTimeout(() => fetch.next({value: 2, max: 5}), 2000);
    setTimeout(() => fetch.next({value: 3, max: 5}), 3000);
    setTimeout(() => fetch.next({value: 4, max: 5}), 4000);
    setTimeout(() => fetch.next({value: 5, max: 5}), 5000);
    return fetch;
  }

  sellerState(seller) {
    const fetch = new Subject();
    setTimeout(() => fetch.next({value: 1, max: 5}), 1000);
    setTimeout(() => fetch.next({value: 2, max: 5}), 2000);
    setTimeout(() => fetch.next({value: 3, max: 5}), 3000);
    setTimeout(() => fetch.next({value: 4, max: 5}), 4000);
    setTimeout(() => fetch.next({value: 5, max: 5}), 5000);
    return fetch;
  }
}
