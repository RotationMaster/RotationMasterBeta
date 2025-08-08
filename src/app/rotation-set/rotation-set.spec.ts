import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationSetComponent } from './rotation-set';

describe('RotationSet', () => {
  let component: RotationSetComponent;
  let fixture: ComponentFixture<RotationSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotationSetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotationSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
