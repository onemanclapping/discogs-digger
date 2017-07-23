import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
@Component({
  selector: 'app-progress-overlay',
  templateUrl: './progress-overlay.component.html',
  styleUrls: ['./progress-overlay.component.css']
})
export class ProgressOverlayComponent implements OnInit {
  public buyerProgressValue;
  public isFetchingResults;
  public sellerName;
  public sellerProgressValue;
  
  private _sub;

  constructor (private _apiService: ApiService) {}

  ngOnInit() {
    this._apiService.isFetchingResultsSubject.subscribe((isFetchingResults: any) => {
      this.isFetchingResults = isFetchingResults;

      if (isFetchingResults) {
        this._sub = this._apiService.fetchingResultsStateSubject.subscribe((res: any) => {
          this.buyerProgressValue = res.buyer.progress;
          this.sellerProgressValue = res.seller.progress;
          this.sellerName = res.seller.name;
        });
      } else {
        this._sub && this._sub.unsubscribe();
      }
    });
  }

  onCancelClick() {
    console.log('cancel clicked');
  }
  
}
