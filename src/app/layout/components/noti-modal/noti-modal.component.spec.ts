import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotiModalComponent } from './noti-modal.component';

describe('NotiModalComponent', () => {
  let component: NotiModalComponent;
  let fixture: ComponentFixture<NotiModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotiModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
