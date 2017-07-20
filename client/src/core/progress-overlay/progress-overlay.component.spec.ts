import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressOverlayComponent } from './progress-overlay.component';

describe('ProgressOverlayComponent', () => {
  let component: ProgressOverlayComponent;
  let fixture: ComponentFixture<ProgressOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
