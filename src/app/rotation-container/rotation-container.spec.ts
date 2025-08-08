import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationContainer } from './rotation-container';

describe('RotationContainer', () => {
  let component: RotationContainer;
  let fixture: ComponentFixture<RotationContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotationContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotationContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
