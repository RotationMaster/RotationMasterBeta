import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeSettingConfig } from '../../models';

describe('RangeSetting', () => {
  let component: RangeSettingConfig;
  let fixture: ComponentFixture<RangeSettingConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeSettingConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeSettingConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
