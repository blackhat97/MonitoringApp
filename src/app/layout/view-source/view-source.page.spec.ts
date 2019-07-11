import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSourcePage } from './view-source.page';

describe('ViewSourcePage', () => {
  let component: ViewSourcePage;
  let fixture: ComponentFixture<ViewSourcePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSourcePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSourcePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
