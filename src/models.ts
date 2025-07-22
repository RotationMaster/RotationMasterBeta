export type RotationSet = {
  name: string; // Name of the rotation set
  data: Rotation[]; // Array of Rotation objects
};

export type Rotation = {
  id: number
  name: string;
  data: Dropdown[];
};

export type Dropdown = {
  seperator: string | '→';
  selectedAbility: Ability | null; // The currently selected ability, or null if none is selected
  notes: string | null;
};

export type Ability = {

  Title: string;
  Emoji: string;       // The emoji representing the ability
  EmojiId: string;     // A unique identifier for the ability
  Category: string;    // The category of the ability
  Src: string;         // The source URL for the ability's image
};