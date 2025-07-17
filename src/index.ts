import './css/main.scss';
import abilities from './asset/abilities.json';
import * as A1 from '@alt1/base';
import * as sauce from './a1sauce';
import * as htmlToImage from 'html-to-image';

var currentOverlayPosition = sauce.getSetting('overlayPosition');
let updatingOverlayPosition = false;
let savedRotationsCache: RotationSet[] = [];

const loadSavedRotations = () => {
  const cachedRotations = localStorage.getItem('savedRotations');

  if (cachedRotations) {
    const parsedRotations = JSON.parse(cachedRotations);

    if (Array.isArray(parsedRotations) && parsedRotations.length > 0) {
      if ('data' in parsedRotations[0]) {
        // If it's already a RotationSet, assign it directly
        savedRotationsCache = parsedRotations as RotationSet[];
      } else {
        // If it's a Rotation, convert it to RotationSets
        savedRotationsCache = parsedRotations.map((rotation: Rotation) => ({
          name: `Rotation ${rotation.id}`, // Use a default name or derive it from the rotation
          data: [{ ...rotation, id: 0 }], // Wrap the rotation in a RotationSet
          selectedIndex: 0
        }));

        // Override the localStorage with the updated RotationSet data
        localStorage.setItem('savedRotations', JSON.stringify(savedRotationsCache));
      }
    } else {
      savedRotationsCache = [];
    }
  } else {
    savedRotationsCache = [];
  }
};

const elementCache: Record<string, HTMLElement | null> = {};

// Utility function to get elements by ID
function getById(id: string): HTMLElement | null {
  // Check if the element is already cached
  if (elementCache[id]) {
    return elementCache[id];
  }

  // If not cached, retrieve the element from the DOM
  const element = document.getElementById(id);
  // save to cache
  elementCache[id] = element;

  return element;
}

// Define variables
let rotationName = '';
let selectedIndex = 0

type RotationSet = {
  name: string; // Name of the rotation set
  data: Rotation[]; // Array of Rotation objects
};
type Rotation = {
  id: number
  name: string;
  data: Dropdown[];
};
type Dropdown = {
  seperator: string | '→';
  selectedAbility: Ability | null; // The currently selected ability, or null if none is selected
  notes: string | null;
};
type Ability = {
  Title: string;
  Emoji: string;       // The emoji representing the ability
  EmojiId: string;     // A unique identifier for the ability
  Category: string;    // The category of the ability
  Src: string;         // The source URL for the ability's image
};

// Retrieve saved rotations from localStorage
const cachedRotations = localStorage.getItem("savedRotations");
const savedRotations = cachedRotations ? JSON.parse(cachedRotations) : [];

let rotationSet: RotationSet; // Initialize as an empty array

const renderRotationContainers = () => {
  const container = getById('rotationContainers');
  if (!container) return;

  container.innerHTML = ''; // Clear existing containers

  rotationSet.data.forEach((rotation, index) => {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'rotation-label-container';
    labelDiv.id = `rotation-label-${rotation.id}`; // Use the id property

    const rotationDiv = document.createElement('div');
    rotationDiv.className = 'rotationContainer';
    rotationDiv.id = `rotationContainer-${rotation.id}`; // Use the id property

    // Add a radio button for selecting the rotation
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.name = 'rotationSelector'; // Group all radio buttons
    radioButton.id = `rotationRadio-${rotation.id}`;
    radioButton.checked = selectedIndex === index; // Check if this is the selected rotation

    // Update the selectedIndex when the radio button is clicked
    radioButton.addEventListener('change', () => {
      selectedIndex = index;
      console.log(`Selected rotation: ${rotation.name}`);
    });

    // Append the radio button and label to the rotation div
    labelDiv.appendChild(radioButton);

    // Add dropdown preview and details
    const rotationLabel = document.createElement('input');
    rotationLabel.type = 'text';
    rotationLabel.className = 'nisinput rotation-name-input'
    rotationLabel.value = rotation.name;
    rotationLabel.placeholder = 'Enter rotation name';
    rotationLabel.id = `rotation-name-${rotation.id}`;
    rotationLabel.addEventListener('input', (e) => {
      rotation.name = (e.target as HTMLInputElement).value.trim();
    });
    labelDiv.appendChild(rotationLabel);

    rotationDiv.appendChild(labelDiv);
    const dropdownsContainer = document.createElement('div');
    dropdownsContainer.className = 'dropdowns-container';
    dropdownsContainer.id = `dropdowns-container-${rotation.id}`;

    const dropdownPreview = document.createElement('div');
    dropdownPreview.className = 'dropdown-preview';
    dropdownPreview.id = `dropdown-preview-${rotation.id}`;
    dropdownsContainer.appendChild(dropdownPreview);

    const rotationDetails = document.createElement('div');
    rotationDetails.className = 'dropdown-details';
    rotationDetails.id = `rotation-details-${rotation.id}`;

    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = `dropdown-container-${rotation.id}`;
    dropdownContainer.innerHTML = '<p>Loading dropdowns...</p>'; // Placeholder text
    rotationDetails.appendChild(dropdownContainer);

    const dropdownControls = document.createElement('div');
    dropdownControls.id = `dropdown-controls-${rotation.id}`;
    dropdownControls.style.marginTop = '10px';

    const addDropdownButton = document.createElement('button');
    addDropdownButton.id = 'dropdown-add-button';
    addDropdownButton.className = 'nisbutton addDropdownButton';
    addDropdownButton.textContent = 'Add Action';
    addDropdownButton.addEventListener('click', () => addDropdown(rotation.id))
    dropdownControls.appendChild(addDropdownButton);

    const clearButton = document.createElement('button');
    clearButton.id = 'clearButton';
    clearButton.className = 'nisbutton clearButton';
    clearButton.style.marginLeft = '10px';
    clearButton.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All';
    clearButton.addEventListener('click', () => clearDropdowns(rotation.id));
    dropdownControls.appendChild(clearButton);

    rotationDetails.appendChild(dropdownControls);
    dropdownsContainer.appendChild(rotationDetails);
    rotationDiv.appendChild(dropdownsContainer);

    // Add buttons for reordering and deleting
    const moveUpButton = document.createElement('button');
    moveUpButton.classList.add('nisbutton');
    moveUpButton.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    moveUpButton.disabled = index === 0;
    moveUpButton.onclick = () => {
      if (index > 0) {
        [rotationSet.data[index - 1], rotationSet.data[index]] = [rotationSet.data[index], rotationSet.data[index - 1]];
        renderRotationContainers();
      }
    };

    const moveDownButton = document.createElement('button');
    moveDownButton.classList.add('nisbutton');
    moveDownButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    moveDownButton.disabled = index === rotationSet.data.length - 1;
    moveDownButton.onclick = () => {
      if (index < rotationSet.data.length - 1) {
        [rotationSet.data[index], rotationSet.data[index + 1]] = [rotationSet.data[index + 1], rotationSet.data[index]];
        renderRotationContainers();
      }
    };

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('nisbutton');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt" > </i>';
    deleteButton.onclick = () => {
      
      if (rotationSet.data.length > 1) {
        if (selectedIndex === index) {
          selectedIndex = 0;
        }
        rotationSet.data.splice(index, 1);
        hideAllButIndex(0)
      }
    };

    // Append buttons to the rotation div
    const controlDiv = document.createElement('div');
    controlDiv.className = 'rotation-controls';

    controlDiv.appendChild(moveUpButton);
    controlDiv.appendChild(moveDownButton);
    controlDiv.appendChild(deleteButton);

    rotationDiv.appendChild(controlDiv);
    // Append the rotation div to the container
    container.appendChild(rotationDiv);

    renderDropdowns(rotation.id);
    renderRotationPreview(rotation.id);
  });
};

const hideAllButIndex = (id: Number) => {
  renderRotationContainers();
  //hide details for all but new rotation
  const dropdownContainer = document.querySelectorAll('.dropdowns-container') as NodeListOf<HTMLElement>;
  dropdownContainer.forEach((container) => {
    if (container.id !== `dropdowns-container-${id}`) {
      const id = container.id.split('-')[2]; // Extract the rotation id from the container id')
      const detailsContainer = document.getElementById(`rotation-details-${id}`) as HTMLElement;
      detailsContainer.style.display = 'none';
      //find the toggleDetailsButton for this detailsContainer
      const toggleDetailsButton = container.querySelector('.toggleDetailsButton') as HTMLElement;
      toggleDetailsButton.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    }
  });
}

const addRotationContainer = () => {
  const newRotation: Rotation = {
    id: rotationSet?.data.length ?? 0, // Assign a unique id
    name: `Rotation ${(rotationSet?.data.length ?? 0) + 1}`, // Default name
    data: [], // Initialize with an empty dropdowns array
  };
  if (!rotationSet) {
    rotationSet = {
      name: 'New Rotation Set',
      data: []
    }
  }
  rotationSet.data.push(newRotation);
  hideAllButIndex(newRotation.id)
};
getById('addRotationContainerButton')?.addEventListener('click', addRotationContainer);

const renderDropdowns = (rotationIndex: number) => {
  // Get the specific dropdown container for the given rotation index
  const dropdownContainer = document.getElementById(`dropdown-container-${rotationIndex}`);
  if (!dropdownContainer) {
    console.warn(`Dropdown container for rotation index ${rotationIndex} not found.`);
    return;
  }

  dropdownContainer.innerHTML = ''; // Clear existing dropdowns in the container

  // Get the dropdowns array for this specific rotation container
  let dropdowns = rotationSet.data[rotationIndex].data; // Assuming each rotationContainer has its own dropdowns array
  if (dropdowns.length == 0) {
    addDropdown(rotationIndex)
    dropdowns = rotationSet.data[rotationIndex].data;
    return;
  }

  dropdowns.forEach((dropdown, dropdownIndex) => {
    // Create a new div for the dropdown
    const dropdownDiv = document.createElement('div');
    dropdownDiv.classList.add('dropdown-container');
    dropdownDiv.id = `dropdown-container-${rotationIndex}-${dropdownIndex}`;

    // Seperator Selector
    const seperatorSelector = document.createElement('select');
    seperatorSelector.className = 'nisdropdown seperator-selector';
    seperatorSelector.id = `seperator-selector-${rotationIndex}-${dropdownIndex}`;
    
    // Add options for common separators
    const separators = ['→', '+', '/', 's', 'r', ''];
    separators.forEach((sep) => {
      const option = document.createElement('option');
      option.value = sep;
      option.textContent = sep;
      if (dropdown.seperator === sep) {
        option.selected = true; // Set the selected option based on the dropdown's seperator
      }
      seperatorSelector.appendChild(option);
    });

    seperatorSelector.addEventListener('change', (e) => {
      const selectedSeperator = (e.target as HTMLSelectElement).value;
      dropdowns[dropdownIndex].seperator = selectedSeperator; // Update the seperator in the dropdown
      renderRotationPreview(rotationIndex); // Update the preview
    });

    //Create the filter input
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Search...';
    filterInput.className = 'nisinput';
    const debounce = (func: Function, delay: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };
    filterInput.addEventListener(
      'input',
      debounce((e: any) => {
        const filter = (e.target as HTMLInputElement).value.toLowerCase();
        const filteredAbilities = abilities.filter(
          (a: any) =>
            a.Category.toLowerCase().includes(filter) ||
            a.Emoji.toLowerCase().includes(filter)
        );
        updateDropdownOptions(selectElement, filteredAbilities);
      }, 300)
    );


    // Create the select element
    const selectElement = document.createElement('select');
    selectElement.className = 'nisdropdown ability-dropdown';
    selectElement.id = `dropdown-${rotationIndex}-${dropdownIndex}`;
    selectElement.innerHTML = `<option value="">Select an ability</option>`; // Add a default option

    // Populate the dropdown with options
    abilities.forEach((ability) => {
      const option = document.createElement('option');
      option.value = ability.Emoji;
      option.textContent = ability.Emoji;
      if (ability.Emoji === dropdown.selectedAbility?.Emoji) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });

    // Add event listener for dropdown changes
    selectElement.addEventListener('change', (e) => {
      const selectedAbility = (e.target as HTMLSelectElement).value;
      const ability = abilities.find((a: Ability) => a.Emoji === selectedAbility);
      if (ability != null) {
        //assign the ability to the dropdowns
        dropdowns[dropdownIndex].selectedAbility = ability;
        //update the image
        abilityImage.src = ability.Src;
        abilityImage.alt = ability.Emoji;

        // Update the preview
        renderRotationPreview(rotationIndex);
      }
    });

    // Create the image for the selected ability
    const abilityImage = document.createElement('img');
    abilityImage.className = 'ability-image';
    if (dropdown.selectedAbility) {
      abilityImage.src = dropdown.selectedAbility.Src;
      abilityImage.alt = dropdown.selectedAbility.Emoji;
    }

    const notes = document.createElement('input');
    notes.className = 'nisinput notes-input';
    notes.placeholder = 'Note...';
    notes.id = `notes-${rotationIndex}-${dropdownIndex}`;
    notes.value = dropdown.notes || ''; // Initialize with existing notes or empty string
    notes.addEventListener('input', (e) => {
      dropdowns[dropdownIndex].notes = (e.target as HTMLTextAreaElement).value; // Update the notes in the dropdown
      renderRotationPreview(rotationIndex); // Update the preview
    });

    // Create the button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    // Add buttons for moving and deleting dropdowns
    const moveUpButton = document.createElement('button');
    moveUpButton.className = 'nisbutton up-button';
    moveUpButton.innerHTML = `<i class="fa-solid fa-chevron-up"></i>`;
    moveUpButton.disabled = dropdownIndex === 0;
    moveUpButton.addEventListener('click', () => {
      if (dropdownIndex > 0) {
        [dropdowns[dropdownIndex - 1], dropdowns[dropdownIndex]] = [dropdowns[dropdownIndex], dropdowns[dropdownIndex - 1]];
        renderDropdowns(rotationIndex);
        renderRotationPreview(rotationIndex);
      }
    });

    const moveDownButton = document.createElement('button');
    moveDownButton.className = 'nisbutton down-button';
    moveDownButton.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
    moveDownButton.disabled = dropdownIndex === dropdowns.length - 1;
    moveDownButton.addEventListener('click', () => {
      if (dropdownIndex < dropdowns.length - 1) {
        [dropdowns[dropdownIndex], dropdowns[dropdownIndex + 1]] = [dropdowns[dropdownIndex + 1], dropdowns[dropdownIndex]];
        renderDropdowns(rotationIndex);
        renderRotationPreview(rotationIndex);
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.className = 'nisbutton delete-button';
    deleteButton.addEventListener('click', () => {
      dropdowns.splice(dropdownIndex, 1);
      renderDropdowns(rotationIndex);
      renderRotationPreview(rotationIndex);
    });

    // Add buttons to the buttonGroup div
    buttonGroup.appendChild(moveUpButton);
    buttonGroup.appendChild(moveDownButton);
    buttonGroup.appendChild(deleteButton);


    // Add the select element to the dropdown div
    dropdownDiv.appendChild(seperatorSelector);
    dropdownDiv.appendChild(filterInput);
    dropdownDiv.appendChild(selectElement);
    dropdownDiv.appendChild(abilityImage);
    dropdownDiv.appendChild(notes);
    dropdownDiv.appendChild(buttonGroup);

    // Add the dropdown div to the container
    dropdownContainer.appendChild(dropdownDiv);
  });
};


const updateDropdownOptions = (selectElement: HTMLSelectElement, abilities: Ability[]) => {
  selectElement.innerHTML = `<option value="">Select an ability</option>`;
  abilities.forEach((ability) => {
    const option = document.createElement('option');
    option.value = ability.Emoji;
    option.textContent = ability.Emoji;
    selectElement.appendChild(option);
  });
};

// Handle rotation name input
const rotationNameInput = getById('rotation-name') as HTMLInputElement;
if (rotationNameInput) {
  rotationNameInput.addEventListener('input', (e) => {
    rotationName = (e.target as HTMLInputElement).value;
  });
}

// Populate the dropdown with saved rotations
const populateSavedRotations = () => {
  const selectElement = document.getElementById("savedRotations") as HTMLSelectElement;
  selectElement.innerHTML = ""; // Clear existing options

  const cachedRotations = localStorage.getItem("savedRotations");
  const savedRotations = cachedRotations ? JSON.parse(cachedRotations) : [];

  // Add a default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = "Select Saved Rotation";
  selectElement.appendChild(defaultOption);

  // Add saved rotations from localStorage
  savedRotations.forEach((rotation: Rotation) => {
    const option = document.createElement("option");
    option.value = rotation.name;
    option.textContent = rotation.name;
    selectElement.appendChild(option);
  });
};


// Save rotation
const saveRotationSet = (rotationSet: RotationSet) => {
  // Retrieve existing saved rotations from localStorage
  const cachedRotations = localStorage.getItem('savedRotations');
  const savedRotations: RotationSet[] = cachedRotations ? JSON.parse(cachedRotations) : [];

  // Check if a RotationSet with the same name already exists
  const existingIndex = savedRotations.findIndex((r) => r.name === rotationSet.name);
  if (existingIndex !== -1) {
    // Update the existing RotationSet
    savedRotations[existingIndex] = rotationSet;
  } else {
    // Add the new RotationSet
    savedRotations.push(rotationSet);
  }

  // Save the updated list back to localStorage
  localStorage.setItem('savedRotations', JSON.stringify(savedRotations));

  // Update the saved rotations dropdown
  populateSavedRotations();

  // select the newly saved rotation
  const rotationDropdown = getById('savedRotations') as HTMLSelectElement;
  if (rotationDropdown) {
    rotationDropdown.value = rotationSet.name; // Set the dropdown to the newly saved rotation
  }
};

const handleSaveRotation = () => {
  if (!rotationName.trim()) {
    try {
      const rotationNameInput = getById('rotation-name') as HTMLInputElement;
      if (rotationNameInput?.value?.trim()) {
        rotationName = rotationNameInput.value.trim();
      } else {
        console.error("Please enter a valid rotation name.");
        return;
      }
    } catch (e) {
      console.error(`An error occurred setting the rotation name. ${e}`);
      return;
    }
  }

  // Create a new RotationSet with the current rotation data
  const newRotationSet: RotationSet = {
    name: rotationName,
    data: rotationSet.data.map((rotation) => ({
      ...rotation,
      data: rotation.data.map((dropdown) => ({
        seperator: dropdown.seperator, // TODO: save properly
        selectedAbility: dropdown.selectedAbility,
        notes: dropdown.notes // TODO: save properly
      })),
    }))
  };

  saveRotationSet(newRotationSet);
  console.log("RotationSet saved successfully!");
};
// Expose function to the global scope so it can be called from HTML
getById('saveButton')?.addEventListener('click', handleSaveRotation);

const handleExportRotation = () => {
  try {
    const rotationNameInput = getById('rotation-name') as HTMLInputElement;
    if (rotationNameInput?.value?.trim()) {
      rotationName = rotationNameInput.value.trim();
    } else {
      console.error("Please enter a valid rotation name.");
      return;
    }
  } catch (e) {
    console.error(`An error occurred setting the rotation name. ${e}`);
    return;
  }

  // Create a RotationSet object for export
  const rotationSetForExport: RotationSet = {
    name: rotationName,
    data: rotationSet.data.map((rotation) => ({
      ...rotation,
    }))
  };

  // Convert the RotationSet to a JSON string
  const rotationSetJson = JSON.stringify(rotationSetForExport, null, 2);

  // Create a Blob and trigger a download
  const blob = new Blob([rotationSetJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rotationName.replace(/\s+/g, '_')}_RotationSet.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log("RotationSet exported successfully!");
};
getById('exportButton')?.addEventListener('click', handleExportRotation);


const defaultRotationSetName = "Rotation Set";
const defaultRotationName = "Rotation";

const handleImportRotation = () => {
  console.log("Importing Rotation");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";

  // Add an event listener to handle file selection
  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (typeof contents === "string") {
        try {
          let parsedData = JSON.parse(contents);

          selectedIndex = 0; // Reset selected index to 0 when switching rotations

          // Assign the parsed RotationSet to the current rotationSet
          rotationSet = parseRotationSetData(contents);
          if (rotationSet.name == defaultRotationSetName)
            rotationSet.name = file.name; // Set the name to the file name

          // Render the imported rotation set
          renderRotationContainers();

          //set the rotation name and the rotation name input value to the file name
          const rotationNameInput = getById('rotation-name') as HTMLInputElement;
          if (rotationNameInput) {
            rotationNameInput.value = rotationSet.name.replace(".json", ""); // Set the input value to the imported rotation name without the .json
          }

        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file.");
        }
      }
    };

    // Read the file as text
    reader.readAsText(file);
  });

  // Trigger the file input dialog
  fileInput.click();
};

getById('importButton')?.addEventListener('click', handleImportRotation);

const handleSwitchRotation = (rotationSetName: string) => {
  console.log(`Switching to RotationSet: ${rotationSetName}`);

  try {
    selectedIndex = 0; // Reset selected index to 0 when switching rotations

    // Retrieve saved rotations from localStorage
    const cachedRotations = localStorage.getItem('savedRotations');

    const savedRotations: RotationSet[] = cachedRotations ? JSON.parse(cachedRotations) : [];



    // Find the RotationSet by name
    const selectedRotationSet = savedRotations.find(
      (rotationSet) => rotationSet.name === rotationSetName
    );

    if (!selectedRotationSet) {
      console.error(`RotationSet with name "${rotationSetName}" not found.`);
      alert(`RotationSet "${rotationSetName}" does not exist.`);
      return;
    }

    // Render the new rotation set
    rotationSet = parseRotationSetData(selectedRotationSet);
    if (rotationSet.name == defaultRotationSetName) // If the rotation set is imported, set the name to the selected rotation name
      rotationSet.name = rotationSetName; // Set the name to the selected rotation name

    renderRotationContainers();

    // sed the rotation name to the selected rotation name
    const rotationNameInput = getById('rotation-name') as HTMLInputElement;
    if (rotationNameInput) {
      rotationNameInput.value = rotationSet.name; // Set the input value to the selected rotation name
    }

    console.log(`Switched to RotationSet: ${rotationSetName}`);
  } catch (err) {
    console.error("Failed to switch rotation:", err);
  }
};
getById('savedRotations')?.addEventListener('change', (e) => {
  const selectedRotation = (e.target as HTMLSelectElement).value;
  handleSwitchRotation(selectedRotation);
});

function parseRotationSetData(rawData: any): RotationSet {

  // If rawData is a string, parse it as JSON
  if (typeof rawData === "string") {
    try {
      rawData = JSON.parse(rawData);
    } catch {
      throw new Error("Invalid JSON string for rotation data.");
    }
  }

  // Format 1: RotationSet (already normalized)
  if (
    typeof rawData === "object" &&
    rawData !== null &&
    typeof rawData.name === "string" &&
    Array.isArray(rawData.data)
  ) {
    //ensure each rotation in rawData.data is of type Rotation, if not format correctly
    if (rawData.data.length === 0)
      rawData.data = [];
    else if (rawData.data[0].hasOwnProperty('Emoji')) //string of ablilities
    {
      rawData.data = [{
        id: 0,
        name: defaultRotationName,
        data: rawData.data.map((ability: Ability) => ({
          seperator: '→',
          selectedAbility: ability,
          notes: null
        })) as Dropdown[]
      }]
    }

    return rawData as RotationSet;
  }

  // Format 2: Object with abilities in data property
  if (
    typeof rawData === "object" &&
    rawData !== null &&
    Array.isArray(rawData.data) &&
    rawData.data.length > 0 &&
    typeof rawData.data[0].Title === "string"
  ) {
    const dropdowns: Dropdown[] = rawData.data.map((ability: Ability) => ({
      seperator: '→',
      selectedAbility: ability,
      notes: null
    }));

    const rotation: Rotation = {
      id: 0,
      name: rawData.name ?? "Imported Rotation",
      data: dropdowns
    };

    return {
      name: rawData.name ?? defaultRotationSetName,
      data: [rotation]
    };
  }

  // Format 3: Array of Dropdowns or Abilities
  if (Array.isArray(rawData) && rawData.length > 0) {
    // If it's an array of abilities
    if (typeof rawData[0].Title === "string") {
      const dropdowns: Dropdown[] = rawData.map((ability: Ability) => ({
        seperator: '→',
        selectedAbility: ability,
        notes: null
      }));

      return {
        name: "Imported Rotation Set",
        data: [{
          id: 0,
          name: "Rotation 1",
          data: dropdowns
        }]
      };
    }
    // If it's an array of dropdowns
    if (rawData[0].selectedAbility) {
      return {
        name: "Imported Rotation Set",
        data: [{
          id: 0,
          name: "Rotation 1",
          data: rawData as Dropdown[]
        }]
      };
    }
  }

  throw new Error("Invalid rotation data format.");
}

const addDropdown = (rotationIndex: number) => {
  // Get the specific rotation from the rotation set
  const rotation = rotationSet.data[rotationIndex];
  if (!rotation) {
    console.error(`Rotation at index ${rotationIndex} not found.`);
    return;
  }

  // Create a new dropdown object
  const newDropdown: Dropdown = {
    seperator: '→', // Default separator
    selectedAbility: null, // Initialize with no selected ability
    notes: null, // Initialize with no notes
  };
  // Push the new dropdown to the rotation's data array
  rotation.data.push(newDropdown);

  renderDropdowns(rotationIndex);
}

// Add event listeners for the "Add Dropdown" button for each rotation
const addDropdownButtons = document.querySelectorAll('.addDropdownButton');
addDropdownButtons.forEach((button, index) => {
  button.addEventListener('click', () => addDropdown(index));
});


// Delete rotation
const deleteRotation = () => {
  const rotationDropdown = getById('savedRotations') as HTMLSelectElement;
  const selectedRotation = rotationDropdown?.value;
  if (!selectedRotation) {
    alert('Please select a rotation to delete.');
    return;
  }
  const index = savedRotations.findIndex((r : any) => r.name === selectedRotation);
  if (index !== -1) {
    savedRotations.splice(index, 1);
    // Save the updated rotations back to localStorage
    localStorage.setItem("savedRotations", JSON.stringify(savedRotations));

    populateSavedRotations();
    alert('Rotation deleted successfully!');
    rotationSet.data.forEach((rotation) => {
      clearDropdowns(rotation.id);
    });
  }
};
getById('deleteRotButton')?.addEventListener('click', deleteRotation);

// Clear all dropdowns
const clearDropdowns = (rotationIndex: number) => {
  // Get the specific rotation from the rotation set
  const rotation = rotationSet.data[rotationIndex];
  if (!rotation) {
    console.error(`Rotation at index ${rotationIndex} not found.`);
    return;
  }

  // Clear the dropdowns array for the specific rotation
  rotation.data = [];

  // Re-render the dropdowns for this specific rotation
  renderDropdowns(rotationIndex);
  renderRotationPreview(rotationIndex);
};
const clearButtons = document.querySelectorAll('.clearButton');
clearButtons.forEach((button, index) => {
  button.addEventListener('click', () => clearDropdowns(index));
});

// Function to update the overlay div
const renderRotationPreview = (rotationIndex: number) => {

  // Get the specific rotation from the rotation set
  const rotation = rotationSet.data[rotationIndex];
  if (!rotation) {
    console.error(`Rotation at index ${rotationIndex} not found.`);
    return;
  }

  const previewContainer = document.getElementById(`dropdown-preview-${rotationIndex}`);
  if (!previewContainer) {
    console.error(`Preview container for rotation index ${rotationIndex} not found.`);
    return;
  }

  // Clear the existing preview content
  previewContainer.innerHTML = '';

  const numImagesPerRow = sauce.getSetting('ablitiesPerRow') || 8;
  const selectedAbilities = rotation.data.filter((dropdown: Dropdown) => dropdown.selectedAbility !== null);
  
  const detailsContainer = document.getElementById(`rotation-details-${rotationIndex}`);
  if (!detailsContainer) {
    console.error(`Details container for rotation index ${rotationIndex} not found.`);
    return;
  }

  const toggleDetailsButton = document.createElement('button');
  toggleDetailsButton.classList.add('toggleDetailsButton');
  toggleDetailsButton.classList.add('nisbutton');
  toggleDetailsButton.innerHTML = detailsContainer.style.display === 'none' ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-chevron-down"></i>';


  const rotPreview = document.createElement('div');
  rotPreview.className = 'rotation-preview';
  rotPreview.id = `rotation-preview-${rotationIndex}`;

  const rows: string[] = [];

  for (let i = 0; i < selectedAbilities.length; i += numImagesPerRow) {
    const rowImages = selectedAbilities
      .slice(i, i + numImagesPerRow)
      .map(
        (dropdown: Dropdown) => {
          return `
        <span class="row-spacer">${dropdown.seperator ?? "→"}</span>
        <span class="ability-image-container" style="position: relative; display: inline-block;">
          <img class="ability-image" src="${dropdown.selectedAbility!.Src}" alt="${dropdown.selectedAbility!.Emoji}" title="${dropdown.selectedAbility!.Emoji}">
          ${dropdown.notes ? `<p class="ability-note">${dropdown.notes}</p>` : ""}
        </span>
      `;
        })
      .join('')

    rows.push(`<div class="rotation-row">${rowImages}</div>`);
  }

  if (rows.length === 0) {
    rotPreview.style.visibility = 'hidden';
    toggleDetailsButton.style.visibility = 'visible';
  }
  else {
    rotPreview.innerHTML = rows.join('');
    rotPreview.style.visibility = 'visible';
    toggleDetailsButton.style.visibility = 'visible';
  }

  previewContainer.appendChild(rotPreview);
  
  
  // Add event listener to toggle the visibility of the details container
  toggleDetailsButton.addEventListener('click', () => {
    if (detailsContainer.style.display === 'none') {
      detailsContainer.style.display = 'block';
      toggleDetailsButton.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    } else {
      detailsContainer.style.display = 'none';
      toggleDetailsButton.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    }
  });

  previewContainer.appendChild(toggleDetailsButton);
};
// Add a listener for changes to #abilitiesPerRow
getById('abilitiesPerRow')?.addEventListener('input', () => {
  rotationSet.data.forEach((rotation) => {
    renderRotationPreview(rotation.id);
  });
});

let config = {
  appName: 'rotationMaster',
};

function initSettings() {
  if (!localStorage[config.appName]) {
    localStorage.setItem(
      config.appName,
      JSON.stringify({
        activeOverlay: true,
        loopSpeed: 150,
        overlayPosition: { x: 100, y: 100 },
        uiScale: 100,
        updatingOverlayPosition: false,
        lastKnownVersion: '0.0.1' // Initial version
      })
    )
  }
}

async function setOverlayPosition() {
  let oldPosition = sauce.getSetting('overlayPosition');
  updatingOverlayPosition = true;
  helperItems.RotationMaster?.classList.toggle(
    'positioning',
    updatingOverlayPosition
  );
  while (updatingOverlayPosition) {
    alt1.setTooltip('Press Alt+1 to save position');
    let abilitiesElement = getById('OverlayCanvasOutput');
    sauce.updateSetting('overlayPosition', {
      x: Math.floor(
        A1.getMousePosition()?.x ?? 100 -
        (sauce.getSetting('uiScale') / 100) * (abilitiesElement?.offsetWidth ?? 2 / 2)
      ),
      y: Math.floor(
        A1.getMousePosition()?.y ?? 100 -
          (sauce.getSetting('uiScale') / 100) * (abilitiesElement?.offsetHeight ?? 2 / 2)
      ),
    });
    currentOverlayPosition = sauce.getSetting('overlayPosition');
    alt1.overLayRefreshGroup('group1');
    await sauce.timeout(50);
  }
  alt1.clearTooltip();
}

function alt1pressed(e: any) {
  if (updatingOverlayPosition) {
    updateLocation(e);
  }
  else {
    cycleRotations();
  }
}

function cycleRotations() {
  var numRots = rotationSet?.data.length || 0;
  if (numRots <= 1) { return; }

  selectedIndex = (selectedIndex + 1) % numRots; // Cycle through rotations

  //update selected value of radiobuttons in ui
  const rotationRadios = document.querySelectorAll('input[name="rotationSelector"]');
  rotationRadios.forEach((radio, index) => {
    (radio as HTMLInputElement).checked = index === selectedIndex;
  });
}

function updateLocation(e : any) {
  let abilitiesElement = getById('Abilities');
  sauce.updateSetting('overlayPosition', {
    x: Math.floor(
      e.x - (sauce.getSetting('uiScale') / 100) * (abilitiesElement?.offsetWidth ?? 2 / 2)
    ),
    y: Math.floor(
      e.y - (sauce.getSetting('uiScale') / 100) * (abilitiesElement?.offsetHeight ?? 2 / 2)
    ),
  });
  updatingOverlayPosition = false;
  helperItems.RotationMaster?.classList.toggle(
    'positioning',
    updatingOverlayPosition
  );
}

const currentVersion = '2.3.0';
const settingsObject = {
  settingsHeader: sauce.createHeading(
    'h2',
    'RotationMaster - v' + currentVersion
  ),
  beginGeneral: sauce.createHeading('h2', 'Settings'),
  OverlayPositionButton: sauce.createButton(
    'Set Overlay Position',
    setOverlayPosition,
    { classes: ['nisbutton'] }
  ),
  ScaleHeader: sauce.createHeading('h3', 'Scale'),
  UIScale: sauce.createRangeSetting(
    'uiScale',
    'Adjusts the size of the Overlay',
    {
      defaultValue: '100',
      min: 50,
      max: 200,
    }
  ),
  AbilitiesPerRowHeader: sauce.createHeading('h3', 'Abilities Per Row'),
  AbilitiesPerRow: sauce.createNumberSetting(
    'ablitiesPerRow',
    'The number of abilities to show per row in the overlay',
    { defaultValue: 10, min: 1, max: 20 },
    renderRotationPreview
  ),
  OverlayRefreshHeader: sauce.createHeading('h3', 'Refresh Rate'),
  OverlayRefreshRate: sauce.createRangeSetting(
    'overlayRefreshRate',
    'The rate that the overlay should refresh - in milliseconds. Requires reloading to take effect.',
    { defaultValue: '50', min: 20, max: 500, unit: 'ms' }
  ),
}

async function fetchPatchNotes(): Promise<any> {
  const response = await fetch("./patchnotes.json");
  return response.json();
}

// Function to check the version and display patch notes
async function checkAndShowPatchNotes(currentVersion: string) {
  const lastKnownVersion = sauce.getSetting('lastKnownVersion') || '0.0.1'; // Default to an initial version if not set'
  
  if (lastKnownVersion == currentVersion) {
    return;
  }

  const patchNotes = await fetchPatchNotes();


  // Filter patches for versions newer than the last known version
  const newPatches = patchNotes.patches.filter(
    (patch: any) => !lastKnownVersion || patch.version > lastKnownVersion
  );

  newPatches.sort((a: any, b: any) => {
    const versionA = a.version.split('.').map(Number);
    const versionB = b.version.split('.').map(Number);

    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
      const numA = versionA[i] || 0; // Default to 0 if undefined
      const numB = versionB[i] || 0; // Default to 0 if undefined
      if (numA !== numB) {
        return numB - numA; // Sort descending
      }
    }
    return 0; // Versions are equal
  });



  // Display patch notes
  if (newPatches.length > 0) {
    console.log('New Patch Notes:');
    newPatches.forEach((patch: any) => {
      console.log(`Version: ${patch.version}`);
      console.log(`Description: ${patch.description}`);
      console.log('Changes:');
      patch.changes.forEach((change: string) => console.log(`- ${change}`));
    });

    const patchNotesContainer = getById('patch-notes-container');
    const patchNotesContent = getById('patch-notes-content');
    if (patchNotesContainer && patchNotesContent) {
      // Populate the patch notes content
      patchNotesContent.innerHTML = newPatches
        .map(
          (patch: any) => `
              <h2>Version: ${patch.version}</h2>
              <p>${patch.description}</p>
              <ul>
                ${patch.changes.map((change: string) => `<li>${change}</li>`).join('')}
              </ul>
            `
        )
        .join('<hr style="margin: 20px 0, border: 1px solid #ccc" />');

      // Show the patch notes container
      patchNotesContainer.style.display = 'block';

      // Add event listener to close button
      const closeButton = getById('close-patch-notes');
      closeButton?.addEventListener('click', () => {
        patchNotesContainer.style.display = 'none';
      });
    }
  }

  // Update the last known version in localStorage
  sauce.updateSetting('lastKnownVersion', currentVersion);
  const newVersion = sauce.getSetting('lastKnownVersion');
  console.log(`Updated last known version to: ${newVersion}`);
}

async function ShowAllPatchNotes() {
  const patchNotes = await fetchPatchNotes();
  const patches = patchNotes?.patches || [];

  //sort by version descending
  patches.sort((a: any, b: any) => {
    const versionA = a.version.split('.').map(Number);
    const versionB = b.version.split('.').map(Number);

    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
      const numA = versionA[i] || 0; // Default to 0 if undefined
      const numB = versionB[i] || 0; // Default to 0 if undefined
      if (numA !== numB) {
        return numB - numA; // Sort descending
      }
    }
    return 0; // Versions are equal
  });
    
  // Display patch notes
  if (patches.length > 0) {
    console.log('New Patch Notes:');
    patches.forEach((patch: any) => {
      console.log(`Version: ${patch.version}`);
      console.log(`Description: ${patch.description}`);
      console.log('Changes:');
      patch.changes.forEach((change: string) => console.log(`- ${change}`));
    });

    const patchNotesContainer = getById('patch-notes-container');
    const patchNotesContent = getById('patch-notes-content');
    if (patchNotesContainer && patchNotesContent) {
      // Populate the patch notes content
      patchNotesContent.innerHTML = patches
        .map(
          (patch: any) => `
              <h2>Version: ${patch.version}</h2>
              <p>${patch.description}</p>
              <ul>
                ${patch.changes.map((change: string) => `<li>${change}</li>`).join('')}
              </ul>
            `
        )
        .join('<hr style="margin: 20px 0, border: 1px solid #ccc" />');

      // Show the patch notes container
      patchNotesContainer.style.display = 'block';

      // Add event listener to close button
      const closeButton = getById('close-patch-notes');
      closeButton?.addEventListener('click', () => {
        patchNotesContainer.style.display = 'none';
      });
    }
  }
}
getById('showPatchNotesButton')?.addEventListener('click', ShowAllPatchNotes);

let helperItems = {
  Output: getById('output'),
  RotationMaster: getById('RotationMaster'),
  Abilities: getById('OverlayCanvasOutput'),
}

function startRotationMaster() {
  loadSavedRotations();
  populateSavedRotations();
  addRotationContainer();

  if (!window.alt1) {
    helperItems.Output?.insertAdjacentHTML(
      'beforeend',
      `<div>You need to run this page in alt1 to capture the screen</div>`
    );
    return;
  }
  if (!alt1.permissionPixel) {
    helperItems.Output?.insertAdjacentHTML(
      'beforeend',
      `<div><p>Page is not installed as app or capture permission is not enabled</p></div>`
    );
    return;
  }
  if (!alt1.permissionOverlay) {
    helperItems.Output?.insertAdjacentHTML(
      'beforeend',
      `<div><p>Attempted to use Overlay but app overlay permission is not enabled. Please enable "Show Overlay" permission in Alt1 settinsg (wrench icon in corner).</p></div>`
    );
    return;
  }

  checkAndShowPatchNotes(currentVersion);
  startOverlay();
}

async function startOverlay() {
  
  const refreshRate = parseInt(sauce.getSetting('overlayRefreshRate'), 10);
  let overlayPosition;

  A1.on('alt1pressed', alt1pressed);

  const updateOverlay = async () => {
    const selectedRotation = rotationSet.data[selectedIndex ?? 0];
    const overlay = document.getElementById(`rotation-preview-${selectedIndex ?? 0}`);
    if (!selectedRotation) {
      console.error('No rotation is selected.');
      return;
    }

    if (!overlay) {
      console.error('Overlay element not found.');
      return;
    }

    const styles = getComputedStyle(overlay);

    const uiScale = sauce.getSetting('uiScale');
    const abilitiesPerRow = sauce.getSetting('ablitiesPerRow');
    overlayPosition = currentOverlayPosition;

    try {
      const totalTrackedItems = selectedRotation.data.filter((dropdown) => dropdown.selectedAbility).length;
      const dataUrl = await htmlToImage.toCanvas(overlay, {
        backgroundColor: 'transparent',
        skipFonts: true,
        width: parseInt(styles.minWidth, 10),
        height:
          parseInt(styles.minHeight, 10) +
          Math.floor((totalTrackedItems / abilitiesPerRow) + 1) *
          27 *
          (uiScale / 100),
        quality: 1,
        pixelRatio: uiScale / 100 - 0.00999999999999999999,
        skipAutoScale: true,
      });

      const base64ImageString = dataUrl
        .getContext('2d')
        ?.getImageData(0, 0, dataUrl.width, dataUrl.height);

      if (base64ImageString) {
        alt1.overLaySetGroup('rotMasterRegion');
        alt1.overLayFreezeGroup('rotMasterRegion');
        alt1.overLayClearGroup('rotMasterRegion');
        alt1.overLayImage(
          overlayPosition.x,
          overlayPosition.y,
          A1.encodeImageString(base64ImageString),
          base64ImageString.width,
          refreshRate
        );
        alt1.overLayRefreshGroup('rotMasterRegion');
      } else {
        alt1.overLayClearGroup('rotMasterRegion');
        alt1.overLayRefreshGroup('rotMasterRegion');
      }
    } catch (e) {
      console.error(`html-to-image failed to capture`, e);
    }

    //Schedule the next update
    setTimeout(() => requestAnimationFrame(updateOverlay), refreshRate);
  }

  // Start the first update
  requestAnimationFrame(updateOverlay);
}

// Initialize the app
const App = () => {
  if (window.alt1) {
    //tell alt1 about the app
    alt1.identifyAppUrl('./appconfig.json');

    initSettings();
    let settings = document.querySelector('#Settings .container');
    Object.values(settingsObject).forEach((val) => {
      settings?.before(val);
    });
    var abilitiesPerRowInput = getById('abilitiesPerRow');
    //  add nisinput to ablilitiesPerRowInput
    if (abilitiesPerRowInput) {
      abilitiesPerRowInput.classList.add('nisinput');
    }

    startRotationMaster();
  }
};


// Start the app
App();

