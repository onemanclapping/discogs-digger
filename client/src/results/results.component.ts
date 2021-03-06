import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../app/api.service';
import { LoginService } from '../app/login.service';
import { ProgressOverlayService } from '../app/progress-overlay/progress-overlay.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  public filteredResults;
  public filters;
  public hasResults;
  public headers: any = [
    {
      name: 'artist',
      canOrder: true,
      desc: false,
      inactive: false
    },
    {
      name: 'title',
      canOrder: true,
      desc: false,
      inactive: true
    },
    {
      name: 'condition',
      canOrder: false
    },
    {
      name: 'price',
      canOrder: true,
      desc: false,
      inactive: true
    }
  ];
  public isFiltersOpen = false;
  public sellerId;

  private _rawResults;
  private _subscription;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _apiService: ApiService,
    private _loginService: LoginService,
    private _progressOverlayService: ProgressOverlayService,
    private _router: Router
  ) { }

  ngOnInit() {
    this._activatedRoute.params.subscribe(params => {
      this._loginService.loggedInSubject.subscribe(loginInfo => {
        if (loginInfo.loggedIn) {
          this.sellerId = params['sellerId'];
          this._subscription = this._apiService.fetchBuyerAndSeller(loginInfo.user, this.sellerId).subscribe((res: any) => {
            this._rawResults = this._matchBuyerWithSeller(res.buyer, res.seller);
            this.hasResults = this._rawResults.length > 0;
            this._generateFilters();
            this._filterResults();
            this._reOrder();
          });

          this._progressOverlayService.setCancelCallback(() => {
            this._subscription.unsubscribe();
            this._router.navigate(['/']);
          });
        } else {
          this._router.navigate(['/']);
        }
      });
    });
  }

  toggleFilter(filterIndex, optionIndex) {
    this.filters[filterIndex].options[optionIndex].selected = !this.filters[filterIndex].options[optionIndex].selected;
    this._filterResults();
    this._reOrder();
  }

  toggleFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  toggleOrderBy(index) {
    if (!this.headers[index].canOrder) return;

    if (this.headers[index].inactive) {
      for (let header of this.headers) {
        header.inactive = true;
      }
      this.headers[index].inactive = false;
    } else {
      this.headers[index].desc = !this.headers[index].desc;
    }

    this._reOrder();
  }

  private _filterResults() {
    this.filteredResults = this._rawResults.filter(item => this.filters.every(filter => {
      if (filter.property === 'artist') {
        return filter.options[0].selected || item.artist !== 'Various';
      }

      const activeOptions = filter.options.filter(option => option.selected).map(option => option.name);

      if (activeOptions.length === 0) return true;

      if (Array.isArray(item[filter.property])) {
        return activeOptions.some(option => item[filter.property].includes(option));
      }

      return activeOptions.includes(item[filter.property]);
    }));
  }

  private _generateFilters() {
    const availableTypesSet = this._rawResults.reduce((set, res) => {
      res.types.forEach(type => set.add(type));
      return set;
    }, new Set());
    const availableTypes = Array.from(availableTypesSet).sort().map(filter => {
      return {
        name: filter,
        selected: false
      };
    });

    const availableConditionsSet = this._rawResults.reduce((set, res) => {
      set.add(res.condition);
      return set;
    }, new Set());
    const availableConditions = Array.from(availableConditionsSet)
      .sort((a, b) => {
        const conditions = ['Mint (M)', 'Near Mint (NM or M-)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good Plus (G+)', 'Good (G)', 'Fair (F)', 'Poor (P)']
        return conditions.indexOf(<any>a) - conditions.indexOf(<any>b);

      })
      .map(condition => {
        return {
          name: condition,
          selected: false
        };
      });


    this.filters = [{
      name: 'Type',
      property: 'types',
      options: availableTypes
    }, {
      name: 'Condition',
      property: 'condition',
      options: availableConditions
    }, {
      name: 'Artists',
      property: 'artist',
      options: [{
        name: 'Show Various (V/A)',
        selected: true
      }]
    }];
  }

  private _matchBuyerWithSeller(buyerResults, sellerResults) {
    return sellerResults.filter(sellerItem => buyerResults.includes(sellerItem.artist));
  }

  private _reOrder() {
    const orderProp = this.headers.find(item => !item.inactive);

    if (orderProp) {
      this.filteredResults.sort((item1, item2) => {
        const prop1 = item1[orderProp.name];
        const prop1title = item1.title;

        const prop2 = item2[orderProp.name];
        const prop2title = item2.title;

        if (prop1 < prop2) {
          return orderProp.desc ? 1 : -1;
        }
        if (prop1 > prop2) {
          return orderProp.desc ? -1 : 1;
        }
        return prop1title < prop2title ? -1 : 1;
      });
    }
  }
}
