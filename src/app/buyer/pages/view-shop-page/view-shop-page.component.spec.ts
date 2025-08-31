import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShopPageComponent } from './view-shop-page.component';

describe('ViewShopPageComponent', () => {
  let component: ViewShopPageComponent;
  let fixture: ComponentFixture<ViewShopPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewShopPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShopPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
