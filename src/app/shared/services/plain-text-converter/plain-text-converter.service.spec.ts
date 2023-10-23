import { TestBed } from '@angular/core/testing';

import { PlainTextConverterService } from './plain-text-converter.service';

describe('PlainTextConverterService', () => {
  let service: PlainTextConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlainTextConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
