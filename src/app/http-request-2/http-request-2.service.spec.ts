import { TestBed } from '@angular/core/testing';

import { HttpRequest2Service } from './http-request-2.service';

describe('HttpRequest2Service', () => {
  let service: HttpRequest2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpRequest2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
