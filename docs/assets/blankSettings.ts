import { RangeSettingConfig, SettingConfig, SettingTypeEnum } from '../models';

export const blankSettings: (SettingConfig)[] = [
    new SettingConfig('activeOverlay', SettingTypeEnum.Boolean, true),
    new RangeSettingConfig('overlayRefreshRate', 'Overlay Refresh Rate', 20, 500, 50, 'ms', 'The rate that the overlay should refresh - in milliseconds. Requires reloading to take effect.'),
    new SettingConfig('overlayPosition', SettingTypeEnum.Grid, { x: 100, y: 100 }, 'Set Overlay Position'),
    new RangeSettingConfig('abilitiesPerRow', 'Abilities Per Row', 1, 20, 10, undefined, 'The number of abilities to show per row in the overlay'),
    new RangeSettingConfig('uiScale', 'UI Scale', 50, 200, 100, undefined, 'Adjusts the size of the Overlay'),
    new SettingConfig('updatingOverlayPosition', SettingTypeEnum.Boolean, false),
    new SettingConfig('lastKnownVersion', SettingTypeEnum.Text, '0.0.1')
];