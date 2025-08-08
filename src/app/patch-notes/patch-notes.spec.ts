import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchNotes } from './patch-notes';

describe('PatchNotes', () => {
  let component: PatchNotes;
  let fixture: ComponentFixture<PatchNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatchNotes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatchNotes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
