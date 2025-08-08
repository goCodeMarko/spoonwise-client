import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAudienceModalComponent } from './select-audience-modal.component';

describe('SelectAudienceModalComponent', () => {
  let component: SelectAudienceModalComponent;
  let fixture: ComponentFixture<SelectAudienceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectAudienceModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAudienceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
