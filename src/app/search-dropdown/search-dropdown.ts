import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output, ViewChild } from '@angular/core';
import { TitleCasePipe, NgClass } from '@angular/common';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { Ability } from '../../models';

@Component({
    selector: 'rm-search-dropdown',
    templateUrl: './search-dropdown.html',
    styleUrls: ['./search-dropdown.scss'],
    imports: [TitleCasePipe, NgClass, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchDropdown),
            multi: true
        }
    ],
    standalone: true
})
export class SearchDropdown {
  list: Ability[] = [];
  tempList: Ability[] = [];
  keyword = "";
  _label: string = "";
  @Output() afterChange = new EventEmitter<Ability>();
  @ViewChild("input", { static: false }) input: ElementRef;
  @Input("items") set items(value: Ability[]) {
    this.list = value;
    this.tempList = value;
  }
  @Input() selectedAbility: Ability | null = null;
  value: any = "Select Ability";
  shown = false;
  constructor(private ele: ElementRef) {
    this.input = ele;
  }

  ngOnChanges() {
    this.value = this.selectedAbility ? this.selectedAbility.Emoji : 'Select Ability';
  }
  search(e: string) {
    const val = e.toLowerCase().trim();
    const temp = this.tempList.filter(x => {
      if(x.Title.toLowerCase().includes(val) ||
          x.Emoji.toLowerCase().includes(val) ||
          x.Category.toLowerCase().includes(val)) {
        return true;
      }
      return false;
    });
    this.list = temp;
  }
  select(item: Ability) {
    this.selectedAbility = item;
    this.value = this.selectedAbility ? this.selectedAbility.Emoji : 'Select Ability';
    this.shown = false;
    this.afterChange.emit(item);
  }
  show() {
    this.shown = this.shown ? false : true;
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 200);
  }
  @HostListener("document:click", ["$event"]) onClick(e: { target: any; }) {
    if (!this.ele.nativeElement.contains(e.target)) {
      this.shown = false;
    }
  }
}
