import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatListPageComponent } from './chat-list-page.component';

describe('ChatListPageComponent', () => {
  let component: ChatListPageComponent;
  let fixture: ComponentFixture<ChatListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
