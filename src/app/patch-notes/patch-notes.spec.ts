import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchNotesComponent } from './patch-notes';

describe('PatchNotes', () => {
  let component: PatchNotesComponent;
  let fixture: ComponentFixture<PatchNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatchNotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatchNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
