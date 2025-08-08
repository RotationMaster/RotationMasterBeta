import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeSetting } from './range-setting';

describe('RangeSetting', () => {
  let component: RangeSetting;
  let fixture: ComponentFixture<RangeSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeSetting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
