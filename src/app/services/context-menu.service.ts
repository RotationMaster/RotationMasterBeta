import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  // ID of the currently open context menu (if any)
  private activeMenuIdSubject = new BehaviorSubject<string | null>(null);
  public activeMenuId$: Observable<string | null> = this.activeMenuIdSubject.asObservable();

  // Open a context menu and close any others
  openMenu(menuId: string): void {
    this.activeMenuIdSubject.next(menuId);
  }

  // Close the context menu if it's the active one
  closeMenu(menuId: string): void {
    if (this.activeMenuIdSubject.value === menuId) {
      this.activeMenuIdSubject.next(null);
    }
  }

  // Close all context menus
  closeAllMenus(): void {
    this.activeMenuIdSubject.next(null);
  }
}
