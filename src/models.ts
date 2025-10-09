export interface IPatch {
    version: string;
    description: string;
    changes: string[];
}

export class Patch implements IPatch {
    version: string;
    description: string;
    changes: string[];

    constructor(version: string, description: string, changes: string[]) {
        this.version = version;
        this.description = description;
        this.changes = changes;
    }
}

export class SettingConfig {
    name: string;
    type: SettingTypeEnum;
    value?: string | boolean | number | { x: number, y: number };
    description?: string;
    classes?: string[];
    hidden: boolean = false;

    constructor(name: string, type: SettingTypeEnum, value?: string | boolean | number | { x: number, y: number }, hidden: boolean = false, description?: string, classes?: string[]) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.description = description;
        this.classes = classes;
        this.hidden = hidden;
    }
}

export class RangeSettingConfig extends SettingConfig {
    label: string;
    minValue: number;
    maxValue: number;
    unit?: string;

    constructor(name: string, label: string, minValue: number, maxValue: number, value?: number, unit?:string, hidden: boolean = false, description?: string, classes?: string[]) {
        super(name, SettingTypeEnum.Range, value, hidden, description, classes);
        this.label = label;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.unit = unit;
    }
}

export class BoolSettingConfig extends SettingConfig {
    label: string;

    constructor(name: string, label: string, value?: boolean, hidden: boolean = false, description?: string, classes?: string[]) {
        super(name, SettingTypeEnum.Boolean, value !== undefined ? value : false, hidden, description, classes);
        this.label = label;
    }
}

export enum SettingTypeEnum {
    Text = 'text',
    Number = 'number',
    Boolean = 'boolean',
    Range = 'range',
    Grid = 'grid'
}

export class RotationSet {
    Name: string;
    Data: Rotation[];

    constructor(name: string | null = null, data: Rotation[] | null = null) {
        this.Name = name ?? 'New Rotation Set';
        this.Data = data ?? [new Rotation()];
    }
}

export class Rotation {
    Id: number;
    Name: string;
    Data: AbilitySelection[];
    Wave: number | null = null;

    constructor(id: number | null = null, name: string | null = null, data: AbilitySelection[] | null = null, wave: number | null = null) {
        this.Id = id ?? 0;
        this.Name = name ?? 'New Rotation';
        this.Data = data ?? [new AbilitySelection()];
        this.Wave = wave ?? null;
    }
}

export class AbilitySelection {
    Separator: string;
    SelectedAbility: Ability | null;
    Notes: string | null;

    constructor(separator: string = '→', selectedAbility: Ability | null = null, notes: string | null = null) {
        this.Separator = separator;
        this.SelectedAbility = selectedAbility;
        this.Notes = notes;
    }
}

export class Ability {
    Title: string;
    Emoji: string;
    EmojiId: string;
    Category: string;
    Src: string;      
    
    constructor(title: string, emoji: string, emojiId: string, category: string, src: string) {
        this.Title = title;
        this.Emoji = emoji;
        this.EmojiId = emojiId;
        this.Category = category;
        this.Src = src;
    }
}

export class Position {
    x: number;
    y: number;
    w: number;
    h: number;
    xos: number;
    yos: number;

    constructor(x: number, y: number, w: number, h: number, xos: number, yos: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.xos = xos;
        this.yos = yos;
    }
}

