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

    // Initialize slider fill on component load
    setTimeout(() => {
      const slider = document.getElementById(this.setting.name) as HTMLInputElement;
      if (slider && this.setting.value !== undefined && this.setting.minValue !== undefined && this.setting.maxValue !== undefined) {
        const percentage = ((Number(this.setting.value) - Number(this.setting.minValue)) / (Number(this.setting.maxValue) - Number(this.setting.minValue))) * 100;
        slider.style.setProperty('--value', `${percentage}%`);
      }
    }, 0);
  }

  valueChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value)) {
      // Update CSS custom property for slider fill
      if (this.setting.minValue !== undefined && this.setting.maxValue !== undefined) {
        const percentage = ((value - Number(this.setting.minValue)) / (Number(this.setting.maxValue) - Number(this.setting.minValue))) * 100;
        target.style.setProperty('--value', `${percentage}%`);
      }
      
      this.onUpdate.emit(value);
    } else {
      console.warn(`Invalid value for setting ${this.setting.name}: ${target.value}`);
    }
  }
}
