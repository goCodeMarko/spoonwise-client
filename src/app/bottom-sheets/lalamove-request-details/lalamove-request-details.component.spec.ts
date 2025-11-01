import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LalamoveRequestDetailsComponent } from './lalamove-request-details.component';

describe('LalamoveRequestDetailsComponent', () => {
  let component: LalamoveRequestDetailsComponent;
  let fixture: ComponentFixture<LalamoveRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LalamoveRequestDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LalamoveRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
