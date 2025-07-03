import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyBusinessPageComponent } from './verify-business-page.component';

describe('VerifyBusinessPageComponent', () => {
  let component: VerifyBusinessPageComponent;
  let fixture: ComponentFixture<VerifyBusinessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyBusinessPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyBusinessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
