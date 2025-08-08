import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RangeSettingConfig } from '../../models';
import { RangeSetting } from '../range-setting/range-setting';

@Component({
  selector: 'rm-settings',
  imports: [RangeSetting],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  @Input() version: string = '0.0.1';
  @Input() settings: RangeSettingConfig[] = [];

  @Output() updateSetting = new EventEmitter<{ name: string, value: any }>();
  @Output() setOverlayPosition = new EventEmitter();
}
