import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http } from '@angular/http';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  public isFetchingResultsSubject = new BehaviorSubject(false);
  public fetchingResultsStateSubject = new Subject();

  private _sellerCache = {};
  private _buyerCache = {};
  private _fetchingState = {
    buyer: {
      name: '',
      progress: 0
    },
    seller: {
      name: '',
      progress: 0
    }
  };

  constructor(private _http: Http) { }

  fetchBuyerAndSeller(buyer, seller) {
    const fetch = new ReplaySubject();
    let trackBuyerProgress = true;
    let trackSellerProgress = true;

    this.isFetchingResultsSubject.next(true);
    this._resetProgress(buyer, seller);
    this._fetchBuyer(buyer).subscribe(buyerRes => {
      trackBuyerProgress = false;
      buyerStateSub && buyerStateSub.unsubscribe();
      this._setBuyerProgress(100);
      this._fetchSeller(seller).subscribe(sellerRes => {
        trackSellerProgress = false;
        sellerStateSub && sellerStateSub.unsubscribe();
        this._setSellerProgress(100);
        this.isFetchingResultsSubject.next(false);
        fetch.next({
          buyer: buyerRes,
          seller: sellerRes
        });
      });
      const sellerStateSub = trackSellerProgress && this._pollSellerState(seller).subscribe((r: number) => {
        if (r === null) r = 0;
        this._setSellerProgress(r);
      });
    });
    const buyerStateSub = trackBuyerProgress && this._pollBuyerState(buyer).subscribe((r: number) => {
      if (r === null) r = 0;
      this._setBuyerProgress(r);
    });

    return fetch;
  }

  getIdentity() {
    return this._http.get('/api/identity').map(res => res.json());
  }

  private _emitProgress() {
    this.fetchingResultsStateSubject.next(this._fetchingState);
  }

  private _fetchBuyer(buyer) {
    if (this._buyerCache[buyer]) return this._buyerCache[buyer];

    const fetch = new ReplaySubject();

    const localKey = `buyer-${buyer}`;
    let local = localStorage.getItem(localKey);
    if (local) {
      fetch.next(JSON.parse(local));
      return fetch;
    }

    this._buyerCache[buyer] = fetch;

    this._http.get(`/api/buyer/${buyer}`).map(res => res.json()).subscribe(res => {
      fetch.next(res);
      localStorage.setItem(localKey, JSON.stringify(res));
    });

    return fetch;
  }

  private _fetchSeller(seller) {
    if (this!._sellerCache[seller]) return this._sellerCache[seller];

    const fetch = new ReplaySubject();

    const localKey = `seller-${seller}`;
    let local = localStorage.getItem(localKey);
    if (local) {
      fetch.next(JSON.parse(local));
      return fetch;
    }

    this._sellerCache[seller] = fetch;

    this._http.get(`/api/seller/${seller}`).map(res => res.json()).subscribe(res => {
      fetch.next(res);
      localStorage.setItem(localKey, JSON.stringify(res));
    });
    
    return fetch;
  }

  private _pollBuyerState(buyer) {
    return IntervalObservable.create(1000)
      .flatMap(() => this._http.get(`/api/status/buyer/${buyer}`)).map(res => res.json());
  }

  private _pollSellerState(seller) {
    return IntervalObservable.create(1000)
      .flatMap(() => this._http.get(`/api/status/seller/${seller}`)).map(res => res.json());
  }

  private _resetProgress(buyerName, sellerName) {
    this._fetchingState.buyer.name = buyerName;
    this._fetchingState.buyer.progress = 0;
    this._fetchingState.seller.name = sellerName;
    this._fetchingState.seller.progress = 0;
    this._emitProgress();
  }

  private _setBuyerProgress(progress) {
    this._fetchingState.buyer.progress = progress;
    this._emitProgress();
  }

  private _setSellerProgress(progress) {
    this._fetchingState.seller.progress = progress;
    this._emitProgress();
  }
}
