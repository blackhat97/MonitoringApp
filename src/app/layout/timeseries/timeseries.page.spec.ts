import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeseriesPage } from './timeseries.page';

describe('TimeseriesPage', () => {
  let component: TimeseriesPage;
  let fixture: ComponentFixture<TimeseriesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeseriesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeseriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
