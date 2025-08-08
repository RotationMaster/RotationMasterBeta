import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationPreview } from './rotation-preview';

describe('RotationPreview', () => {
  let component: RotationPreview;
  let fixture: ComponentFixture<RotationPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotationPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotationPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
