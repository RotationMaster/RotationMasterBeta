import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbilitySelector } from './ability-selector';

describe('AbilitySelector', () => {
  let component: AbilitySelector;
  let fixture: ComponentFixture<AbilitySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbilitySelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbilitySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
