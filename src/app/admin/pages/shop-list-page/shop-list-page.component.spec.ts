import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopListPageComponent } from './shop-list-page.component';

describe('ShopListPageComponent', () => {
  let component: ShopListPageComponent;
  let fixture: ComponentFixture<ShopListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShopListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
