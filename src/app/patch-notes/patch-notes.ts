import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPatch } from '../../models';

@Component({
  selector: 'rm-patch-notes',
  imports: [],
  templateUrl: './patch-notes.html',
  styleUrl: './patch-notes.scss'
})
export class PatchNotesComponent {
  @Input() patchNotes: IPatch[] = [];
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
}
