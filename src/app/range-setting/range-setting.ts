import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RangeSettingConfig } from '../../models';

@Component({
    selector: 'rm-range-setting',
    templateUrl: './range-setting.html',
    styleUrls: ['./range-setting.scss']
})
export class RangeSetting {
  @Input() setting!: RangeSettingConfig;

  @Output() onUpdate = new EventEmitter<number>();

  ngOnInit() {
    //find the container div by id
    const container = document.getElementById("container");
    if (container) {
      this.setting.classes?.forEach((className: string) => {
        container.classList.add(className);
      });
    }
  }

  valueChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value)) {
      this.onUpdate.emit(value);
    } else {
      console.warn(`Invalid value for setting ${this.setting.name}: ${target.value}`);
    }
  }
}
