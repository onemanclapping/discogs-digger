import { Injectable } from '@angular/core';

@Injectable()
export class ResultsService {
  private results = {
    gajo: [
      {
        artist: "Pink Floyd",
        condition: "Near Mint (NM or M-)",
        currency: "EUR",
        media: ["LP", '12"'],
        price: 45,
        releaseId: 3958614,
        title: "Meddle (LP, Album, Club, RE)",
        uri: "https://www.discogs.com/sell/item/190248021"
      },
      {
        artist: "Pink Floyd2",
        condition: "VG",
        currency: "EUR2",
        media: ["LP2"],
        price: 452,
        releaseId: 39586142,
        title: "Meddle (LP, Album, Club, RE)2",
        uri: "https://www.discogs.com/sell/item/1902480212"
      }
    ]
  }

  constructor() { }

  getResults(id) {
    return this.results[id];
  }

}
