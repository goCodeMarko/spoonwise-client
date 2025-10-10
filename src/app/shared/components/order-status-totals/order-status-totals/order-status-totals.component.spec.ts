import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusTotalsComponent } from './order-status-totals.component';

describe('OrderStatusTotalsComponent', () => {
  let component: OrderStatusTotalsComponent;
  let fixture: ComponentFixture<OrderStatusTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderStatusTotalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStatusTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
