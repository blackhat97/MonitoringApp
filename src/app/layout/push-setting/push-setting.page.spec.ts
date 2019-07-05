import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PushSettingPage } from './push-setting.page';

describe('PushSettingPage', () => {
  let component: PushSettingPage;
  let fixture: ComponentFixture<PushSettingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PushSettingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PushSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
