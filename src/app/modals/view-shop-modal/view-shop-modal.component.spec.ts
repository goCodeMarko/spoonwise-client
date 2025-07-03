import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShopModalComponent } from './view-shop-modal.component';

describe('ViewShopModalComponent', () => {
  let component: ViewShopModalComponent;
  let fixture: ComponentFixture<ViewShopModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewShopModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShopModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
