import { Component, Input, TrackByFunction } from '@angular/core';
import { Ability, AbilitySelection } from '../../models';

@Component({
    selector: 'rm-rotation-preview',
    templateUrl: './rotation-preview.html',
    styleUrls: ['./rotation-preview.scss'],
    standalone: false
})
export class RotationPreview {
  @Input() AbilitySelections: AbilitySelection[] = [];
  @Input() abilitiesPerRow: number = 10;
  @Input() index: number = 0;

  getAbilityRows(): AbilitySelection[][] {
    return this.calculateAbilityRows();
  }

  private calculateAbilityRows(): AbilitySelection[][] {
    // convert AbilitySelections into an array of ability-rows
    let abilityRows: AbilitySelection[][] = [];
    let currentRow = 0;
    let itemsInCurrentRow = 0;

    // Initialize the first row
    abilityRows.push([]);

    for(let i = 0; i < this.AbilitySelections.length; i++) {
      const selection = this.AbilitySelections[i];
      
      // Check if we need to start a new row due to newline separator
      if (selection.Separator.includes('↵')) {
        // If the current row is not empty, start a new row
        if (itemsInCurrentRow > 0) {
          abilityRows.push([]);
          currentRow++;
          itemsInCurrentRow = 0;
        }
        // Create a copy to avoid mutating the original
        const displaySelection = { ...selection };
        displaySelection.Separator = selection.Separator.replace('↵', '').trim();
        abilityRows[currentRow].push(displaySelection);
        itemsInCurrentRow++;
      } 
      // Check if we need to start a new row due to reaching max items per row
      else if (itemsInCurrentRow >= this.abilitiesPerRow && itemsInCurrentRow > 0) {
        abilityRows.push([]);
        currentRow++;
        itemsInCurrentRow = 0;
        abilityRows[currentRow].push(selection);
        itemsInCurrentRow++;
      } 
      // Add to current row
      else {
        abilityRows[currentRow].push(selection);
        itemsInCurrentRow++;
      }
    }

    // Filter out any empty rows
    return abilityRows.filter(row => row.length > 0);
  }

  showPreview(): boolean {
    const hasAbilities = Array.isArray(this.AbilitySelections) && this.AbilitySelections.some(sel => !!sel.SelectedAbility);
    
    // Debug logging
    if (hasAbilities) {
      console.log('Preview data:', {
        selectionsCount: this.AbilitySelections.length,
        abilitiesWithImages: this.AbilitySelections.filter(sel => sel.SelectedAbility).map(sel => ({
          title: sel.SelectedAbility?.Title,
          src: sel.SelectedAbility?.Src
        })),
        rows: this.calculateAbilityRows()
      });
    }
    
    return hasAbilities;
  }

  // TrackBy functions for better performance
  trackByRowIndex: TrackByFunction<AbilitySelection[]> = (index: number, row: AbilitySelection[]) => {
    return index;
  };

  trackByAbilitySelection: TrackByFunction<AbilitySelection> = (index: number, selection: AbilitySelection) => {
    return selection.SelectedAbility?.Title + '_' + selection.Separator + '_' + selection.Notes + '_' + index;
  };

  onImageError(event: Event, ability: Ability): void {
    console.error('Image failed to load:', {
      src: ability.Src,
      title: ability.Title,
      event
    });
    // You could set a fallback image here
    const img = event.target as HTMLImageElement;
    img.style.backgroundColor = '#ff0000'; // Red background to indicate error
    img.alt = `Failed to load: ${ability.Title}`;
  }

  onImageLoad(event: Event, ability: Ability): void {
    console.log('Image loaded successfully:', ability.Title, ability.Src);
  }
}