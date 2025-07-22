import abilities from './asset/abilities.json';
import { Ability, Dropdown } from './models';

export function lookupAbilityByTitle(emojiString: string) : Ability | null {
  const ability = abilities.find((ability) => ability.Title.toLowerCase() === emojiString.toLowerCase());
  if (ability) {
    return ability;
  }
  return null
}

export function lookupAbilityByEmoji(emojiString: string) : Ability | null {
  const ability = abilities.find((ability) => ability.Emoji.toLowerCase() === emojiString.toLowerCase());
  if (ability) {
    return ability;
  }
  return null;
}

const blank = lookupAbilityByTitle('literallynothing') as Ability;

const separators = ['\\+', '→', '>', '/', 's', 'r', 'tc'];
const regex = new RegExp(`\\s*(${separators.join('|')})\\s*([^${separators.join('')}]+)`, 'g');


export function convertStringToDropdowns(inputString: string): Dropdown[] {
  let result = [] as Dropdown[];

  const pairs = extractPairs(inputString);

  for (const [separator, abilityString] of pairs) {
    const dropdown: Dropdown = {
      seperator: separator != null ? separator : '→',
      selectedAbility: null,
      notes: ''
    };

    let string = abilityString;

    // check if abilityString contains a :...: pattern
    const colonMatch = abilityString.match(/:[^:]+:/);
    if (colonMatch) {
      // abilityString contains a :...: pattern
      // put the contents of the :...: pattern into lookupAbilityByTitle
      const abilityName = colonMatch[0].slice(1, -1); // remove surrounding colons
      const ability = lookupAbilityByTitle(abilityName);
      if (ability) {
        dropdown.selectedAbility = ability;
        // Remove all :...: patterns from notes
        string = abilityString.replace(/:[^:]+:/g, '').trim();
      }
    }
    if (string.length > 0) {
      {
        dropdown.notes = string;
      }
    }

    result.push(dropdown);
  }
  return result;
}

function splitColonSegments(input: string, seperator: string): [string, string][] {
  const regex = /(:[^:]+:)(.*?)(?=:[^:]+:|$)/g;
  const pairs: [string, string][] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    // match[1] is the :...: pattern, match[2] is the content after it (may be empty)
    const segment = (match[1] + (match[2] || '')).trim();
    pairs.push([seperator, segment]);
    seperator = '';
  }

  return pairs;
}

function extractPairs(input: string): [string, string][] {
  input = input.replace(/[()]/g, '').replace('→ tc +', 'tc').trim();

  // Stage 1: Symbol separators (no boundaries)
  const symbolSeparators = ['\\+', '→', '/', '>'];
  const symbolSplitRegex = new RegExp(`\\s*(${symbolSeparators.join('|')})\\s*`);
  const symbolTokens = input.split(symbolSplitRegex).filter(token => token !== undefined && token.trim() !== '');

  // Stage 2: Word separators (with boundaries)
  const wordSeparators = ['s', 'r', 'tc'];
  const wordSplitRegex = new RegExp(`\\b(${wordSeparators.join('|')})\\b`);

  const pairs: [string, string][] = [];
  let currentSeparator = '→';

  for (let token of symbolTokens) {
    if (symbolSeparators.includes(token) || token === '+') {
      currentSeparator = token;
      continue;
    }

    // Split by word separators inside each symbol token
    let wordTokens = token.split(wordSplitRegex).filter(t => t !== undefined && t.trim() !== '');

    for (let wt of wordTokens) {
      if (wordSeparators.includes(wt)) {
        currentSeparator = wt;
      } else {
        const colonSegments = splitColonSegments(wt.trim(), currentSeparator);
        if (colonSegments.length > 0) {
          for (const segment of colonSegments) {
            pairs.push(segment);
          }
        } else if (wt.trim().length > 0) {
          pairs.push([currentSeparator, wt.trim()]);
        }
      }
    }
  }

  return pairs;
}

export function convertDropdownsToString(dropdowns: Dropdown[]): string {
  let result = '';

  for (const dropdown of dropdowns) {
    let separator = dropdown.seperator || '→';
    if (separator.includes('↵')) {
      result += '\n';
      separator.replace('↵ ', '');
    }
    separator.replace('tc', '→ (tc) +')

    result += (separator === "" ? " " : ` ${separator} `);

    if (dropdown.selectedAbility) {
      if (dropdown.selectedAbility.Title == blank.Title && dropdown.notes && dropdown.notes.length > 0) {
        result += dropdown.notes;
      }
      else {
        result += `:${dropdown.selectedAbility.Title}:`
        if (dropdown.notes && dropdown.notes.length > 0) {
          result += ` ${dropdown.notes}`;
        }
      }
    }
  }

  return result.trim();
}

function isSeperator(character: string) : boolean {
  return character === '+' || character === '→' || character === '/' || character === 's' || character === 'r' || character === 'tc';
}