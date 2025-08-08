import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatchNotes } from "./patch-notes/patch-notes";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PatchNotes],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('RotationMaster');
}
