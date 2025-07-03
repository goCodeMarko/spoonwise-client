import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyBusinessComponent } from './verify-business.component';

describe('VerifyBusinessComponent', () => {
  let component: VerifyBusinessComponent;
  let fixture: ComponentFixture<VerifyBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyBusinessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
