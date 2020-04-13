import { TestBed } from '@angular/core/testing';

import { IndiaService } from './india.service';

describe('IndiaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndiaService = TestBed.get(IndiaService);
    expect(service).toBeTruthy();
  });
});
