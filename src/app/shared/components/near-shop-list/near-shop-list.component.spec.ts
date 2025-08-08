import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearShopListComponent } from './near-shop-list.component';

describe('NearShopListComponent', () => {
  let component: NearShopListComponent;
  let fixture: ComponentFixture<NearShopListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NearShopListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NearShopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
