import { TestBed, inject } from '@angular/core/testing';

import { DigService } from './dig.service';

describe('DigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DigService]
    });
  });

  it('should ...', inject([DigService], (service: DigService) => {
    expect(service).toBeTruthy();
  }));
});
