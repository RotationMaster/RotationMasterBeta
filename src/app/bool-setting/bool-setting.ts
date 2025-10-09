import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoolSettingConfig } from '../../models';

@Component({
    selector: 'rm-bool-setting',
    templateUrl: './bool-setting.html',
    styleUrls: ['./bool-setting.scss']
})
export class BoolSetting {
  @Input() setting!: BoolSettingConfig;

  @Output() onUpdate = new EventEmitter<boolean>();

  ngOnInit() {
    // Find the container div by id and apply any classes
    const container = document.getElementById("bool-container");
    if (container && this.setting.classes) {
      this.setting.classes.forEach((className: string) => {
        container.classList.add(className);
      });
    }
  }

  valueChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.checked;
    this.setting.value = value;
    this.onUpdate.emit(value);
  }
}
