import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultsService } from '../app/results.service';
import { ApiService } from '../app/api.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  sellerId: String = 'seller';
  rawResults: any[];
  filteredResults: any[];
  isFiltersOpen: boolean = false;
  buyerProgressValue: Number = 0;
  sellerProgressValue: Number = 0;
  isWorking: boolean = true;
  headers:any = [
    {
      name: 'artist',
      canOrder: true,
      desc: false,
      inactive: true
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
  filters;

  constructor(private route: ActivatedRoute,
    private resultsService: ResultsService,
    private apiService: ApiService,
    private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.isWorking = true;
      this.sellerId = params['sellerId'];
        this.apiService.fetchBuyerAndSeller('onemanclap', this.sellerId).subscribe(res => {
          this.buyerProgressValue = res.buyer.progress;
          this.sellerProgressValue = res.seller.progress;
          
          if (res.buyer.result && res.seller.result) {
            this.isWorking = false;

            this.rawResults = this.matchBuyerWithSeller(res.buyer.result, res.seller.result);
            this.generateFilters();
            this.filterResults();
            this.reOrder();
          }
        });
    });
  }

  generateFilters() {
    const availableTypesSet = this.rawResults.reduce((set, res) => {
      res.types.forEach(type => set.add(type));
      return set;
    }, new Set());
    const availableTypes = Array.from(availableTypesSet).sort().map(filter => {
      return {
        name: filter,
        selected: false
      };
    });

    const availableConditionsSet = this.rawResults.reduce((set, res) => {
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

  filterResults() {
    this.filteredResults = this.rawResults.filter(item => this.filters.every(filter => {
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

  toggleFilter(filterIndex, optionIndex) {
    this.filters[filterIndex].options[optionIndex].selected = !this.filters[filterIndex].options[optionIndex].selected;
    this.filterResults();
    this.reOrder();
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

    this.reOrder();
  }

  reOrder() {
    const orderProp = this.headers.find(item => !item.inactive);

    if (orderProp) {
      this.filteredResults.sort((item1, item2) => {
        const prop1 = item1[orderProp.name];
        const prop2 = item2[orderProp.name];

        if (orderProp.desc) {
          return prop1 < prop2 ? 1 : -1;
        }
        return prop1 > prop2 ? 1: -1;
      });
    }
  }

  cancelFetch() {
    this.router.navigate(['/']);
  }

  matchBuyerWithSeller(buyerResults, sellerResults) {
    return sellerResults.filter(sellerItem => buyerResults.includes(sellerItem.artist));
  }
}
