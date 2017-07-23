import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient } from '@angular/common/http';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  isFetchingResultsSubject = new BehaviorSubject(false);
  fetchingResultsStateSubject = new Subject();
  private sellerCache = {};
  private buyerCache = {};
  private fetchingState = {
    buyer: {
      name: '',
      progress: 0
    },
    seller: {
      name: '',
      progress: 0
    }
  };

  constructor(private http: HttpClient) { }

  fetchBuyer(buyer) {
    if (this.buyerCache[buyer]) return this.buyerCache[buyer];

    const fetch = new ReplaySubject();

    const localKey = `buyer-${buyer}`;
    let local = localStorage.getItem(localKey);
    if (local) {
      fetch.next(JSON.parse(local));
      return fetch;
    }

    this.buyerCache[buyer] = fetch;

    this.http.get(`/api/buyer/${buyer}`).subscribe(res => {
      fetch.next(res);
      localStorage.setItem(localKey, JSON.stringify(res));
    });

    return fetch;
  }

  fetchSeller(seller) {
    if (this!.sellerCache[seller]) return this.sellerCache[seller];

    const fetch = new ReplaySubject();

    const localKey = `seller-${seller}`;
    let local = localStorage.getItem(localKey);
    if (local) {
      fetch.next(JSON.parse(local));
      return fetch;
    }

    this.sellerCache[seller] = fetch;

    this.http.get(`/api/seller/${seller}`).subscribe(res => {
      fetch.next(res);
      localStorage.setItem(localKey, JSON.stringify(res));
    });
    
    return fetch;
  }

  private emitProgress() {
    this.fetchingResultsStateSubject.next(this.fetchingState);
  }

  private setBuyerProgress(progress) {
    this.fetchingState.buyer.progress = progress;
    this.emitProgress();
  }

  private setSellerProgress(progress) {
    this.fetchingState.seller.progress = progress;
    this.emitProgress();
  }

  private resetProgress(buyerName, sellerName) {
    this.fetchingState.buyer.name = buyerName;
    this.fetchingState.buyer.progress = 0;
    this.fetchingState.seller.name = sellerName;
    this.fetchingState.seller.progress = 0;
    this.emitProgress();
  }

  fetchBuyerAndSeller(buyer, seller) {
    const fetch = new ReplaySubject();
    let trackBuyerProgress = true;
    let trackSellerProgress = true;

    this.isFetchingResultsSubject.next(true);
    this.resetProgress(buyer, seller);
    this.fetchBuyer(buyer).subscribe(buyerRes => {
      trackBuyerProgress = false;
      buyerStateSub && buyerStateSub.unsubscribe();
      this.setBuyerProgress(100);
      this.fetchSeller(seller).subscribe(sellerRes => {
        trackSellerProgress = false;
        sellerStateSub && sellerStateSub.unsubscribe();
        this.setSellerProgress(100);
        this.isFetchingResultsSubject.next(false);
        fetch.next({
          buyer: buyerRes,
          seller: sellerRes
        });
      });
      const sellerStateSub = trackSellerProgress && this.sellerState(seller).subscribe((r: number) => {
        if (r === null) r = 0;
        this.setSellerProgress(r);
      });
    });
    const buyerStateSub = trackBuyerProgress && this.buyerState(buyer).subscribe((r: number) => {
      if (r === null) r = 0;
      this.setBuyerProgress(r);
    });

    return fetch;
  }

  buyerState(buyer) {
    return IntervalObservable.create(1000)
      .flatMap(() => this.http.get(`/api/status/buyer/${buyer}`));
  }

  sellerState(seller) {
    return IntervalObservable.create(1000)
      .flatMap(() => this.http.get(`/api/status/seller/${seller}`));
  }

  getIdentity() {
    return this.http.get('/api/identity');
  }
}
