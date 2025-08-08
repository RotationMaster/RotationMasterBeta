import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationSet } from './rotation-set';

describe('RotationSet', () => {
  let component: RotationSet;
  let fixture: ComponentFixture<RotationSet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotationSet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotationSet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
