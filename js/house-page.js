
import { getData, saveData } from './storage.js';
import { initializeData } from '../data.js';

// HOUSE ELEMENTS
const createHouseForm = document.getElementById('createHouseForm');
const houseNameInput = document.getElementById('houseName');
const houseAddressInput = document.getElementById('houseAddress');
const deleteHouseButton = document.getElementById('deleteHouseButton');
const housesList = document.getElementById('housesList');
const formMessage = document.getElementById('formMessage');
const houseCountElement = document.getElementById('houseCount');

// MEMBER ELEMENTS
const addMemberForm = document.getElementById('addMemberForm');
const memberHouseInput = document.getElementById('memberHouse');
const memberNameInput = document.getElementById('memberName');
const memberMessage = document.getElementById('memberMessage');
const membersList = document.getElementById('membersList');

// Store the ID of the selected house
let selectedHouseId = null;


// SHOW A MESSAGE
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = 'form-message mb-3 ' + type;
}


// DISPLAY ALL HOUSES
function displayHouses() {
  const data = getData();
  const houses = data.houses;

  // Update the house count
  houseCountElement.textContent =
    houses.length + (houses.length === 1 ? ' house' : ' houses');

  // Clear the current house list
  housesList.innerHTML = '';

  // Check if there are no houses
  if (houses.length === 0) {
    housesList.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <i class="fa-solid fa-house-circle-exclamation"></i>
          <p>No houses to display yet.</p>
          <p>Create your first house using the form above.</p>
        </div>
      </div>
    `;

    selectedHouseId = null;
    memberHouseInput.value = '';
    deleteHouseButton.disabled = true;

    displayMembers();
    return;
  }

  // Check that the selected house still exists
  const selectedHouse = houses.find(function (house) {
    return house.id === selectedHouseId;
  });

  if (!selectedHouse) {
    selectedHouseId = null;
  }

  // Display each house
  houses.forEach(function (house) {
    const houseCard = document.createElement('div');
    houseCard.className = 'col-12';

    const card = document.createElement('div');
    card.className = 'card';

    // Highlight the selected house
    if (selectedHouseId === house.id) {
      card.style.borderLeft = '4px solid var(--primary-color)';
      card.style.backgroundColor = 'var(--background-color)';
    }

    const cardBody = document.createElement('div');
    cardBody.className =
      'card-body d-flex justify-content-between align-items-center gap-3';

    // House information
    const houseDetails = document.createElement('div');

    const houseTitle = document.createElement('h3');
    houseTitle.className = 'h5 fw-bold mb-2';
    houseTitle.textContent = house.name;

    const houseAddress = document.createElement('p');
    houseAddress.className = 'text-muted mb-2';
    houseAddress.textContent = house.address;

    // Count members in this house
    const houseMembers = data.members.filter(function (member) {
      return member.houseId === house.id;
    });

    const memberCount = document.createElement('small');
    memberCount.className = 'text-secondary';
    memberCount.textContent =
      houseMembers.length +
      (houseMembers.length === 1 ? ' member' : ' members');

    houseDetails.appendChild(houseTitle);
    houseDetails.appendChild(houseAddress);
    houseDetails.appendChild(memberCount);

    // Select house button
    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className =
      selectedHouseId === house.id
        ? 'btn btn-primary btn-sm'
        : 'btn btn-outline-primary btn-sm';

    selectButton.textContent =
      selectedHouseId === house.id ? 'Selected' : 'Select House';

    selectButton.addEventListener('click', function () {
      selectedHouseId = house.id;
      memberHouseInput.value = house.id;

      deleteHouseButton.disabled = false;

      displayHouseOptions();
      displayHouses();
      displayMembers();
    });

    cardBody.appendChild(houseDetails);
    cardBody.appendChild(selectButton);

    card.appendChild(cardBody);
    houseCard.appendChild(card);

    housesList.appendChild(houseCard);
  });

  deleteHouseButton.disabled = selectedHouseId === null;
}


// FILL THE HOUSE DROPDOWN
function displayHouseOptions() {
  const data = getData();

  memberHouseInput.innerHTML = `
    <option value="">Choose a house</option>
  `;

  data.houses.forEach(function (house) {
    const option = document.createElement('option');

    option.value = house.id;
    option.textContent = house.name;

    memberHouseInput.appendChild(option);
  });

  if (selectedHouseId !== null) {
    memberHouseInput.value = selectedHouseId;
  }
}


// DISPLAY MEMBERS OF THE SELECTED HOUSE ONLY
function displayMembers() {
  const data = getData();

  membersList.innerHTML = '';

  // Ask the user to select a house
  if (selectedHouseId === null) {
    membersList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-users"></i>
        <p>Select a house to view its members.</p>
      </div>
    `;

    return;
  }

  // Find the selected house
  const selectedHouse = data.houses.find(function (house) {
    return house.id === selectedHouseId;
  });

  if (!selectedHouse) {
    selectedHouseId = null;
    displayMembers();
    return;
  }

  // Display the selected house name
  const heading = document.createElement('h3');
  heading.className = 'h5 fw-bold mb-3';
  heading.textContent = selectedHouse.name + ' — Members';

  membersList.appendChild(heading);

  // Get only the members belonging to this house
  const houseMembers = data.members.filter(function (member) {
    return member.houseId === selectedHouseId;
  });

  // Check if the house has members
  if (houseMembers.length === 0) {
    const message = document.createElement('p');
    message.className = 'text-muted';
    message.textContent =
      'No members have been added to this house yet.';

    membersList.appendChild(message);
    return;
  }

  // Display each member
  houseMembers.forEach(function (member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'card mb-2';

    const cardBody = document.createElement('div');
    cardBody.className =
      'card-body d-flex justify-content-between align-items-center gap-3';

    const memberName = document.createElement('p');
    memberName.className = 'fw-semibold mb-0';
    memberName.textContent = member.name;

    // Edit and delete buttons
    const buttons = document.createElement('div');
    buttons.className = 'd-flex gap-2';

    // EDIT BUTTON
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'btn btn-outline-primary btn-sm';
    editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editButton.title = 'Edit member';
    editButton.setAttribute('aria-label', 'Edit ' + member.name);

    editButton.addEventListener('click', function () {
      editMember(member.id);
    });

    // DELETE BUTTON
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.title = 'Delete member';
    deleteButton.setAttribute('aria-label', 'Delete ' + member.name);

    deleteButton.addEventListener('click', function () {
      deleteMember(member.id);
    });

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);

    cardBody.appendChild(memberName);
    cardBody.appendChild(buttons);

    memberCard.appendChild(cardBody);
    membersList.appendChild(memberCard);
  });
}


// CREATE A HOUSE
createHouseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const houseName = houseNameInput.value.trim();
  const houseAddress = houseAddressInput.value.trim();

  if (houseName === '' || houseAddress === '') {
    showMessage(
      formMessage,
      'Please enter the house name and address.',
      'text-danger'
    );
    return;
  }

  const data = getData();

  // Prevent duplicate house names
  const houseExists = data.houses.some(function (house) {
    return house.name.toLowerCase() === houseName.toLowerCase();
  });

  if (houseExists) {
    showMessage(
      formMessage,
      'A house with this name already exists.',
      'text-danger'
    );
    return;
  }

  // Create the new house
  const newHouse = {
    id: Date.now(),
    name: houseName,
    address: houseAddress,
    memberIds: [],
    createdAt: new Date().toISOString()
  };

  data.houses.push(newHouse);

  saveData(data);

  // Automatically select the new house
  selectedHouseId = newHouse.id;

  createHouseForm.reset();

  showMessage(
    formMessage,
    'House created successfully!',
    'text-success'
  );

  displayHouseOptions();
  displayHouses();
  displayMembers();
});


// DELETE A HOUSE
deleteHouseButton.addEventListener('click', function () {
  if (selectedHouseId === null) {
    showMessage(
      formMessage,
      'Please select a house first.',
      'text-danger'
    );
    return;
  }

  const data = getData();

  // Prevent deleting houses that have expenses
  const houseExpenses = data.expenses.filter(function (expense) {
    return expense.houseId === selectedHouseId;
  });

  if (houseExpenses.length > 0) {
    showMessage(
      formMessage,
      'This house has expense records. Please review them before deleting the house.',
      'text-danger'
    );
    return;
  }

  const answer = confirm(
    'Are you sure you want to delete this house and its members?'
  );

  if (!answer) {
    return;
  }

  // Remove the house
  data.houses = data.houses.filter(function (house) {
    return house.id !== selectedHouseId;
  });

  // Remove members belonging to this house
  data.members = data.members.filter(function (member) {
    return member.houseId !== selectedHouseId;
  });

  // Remove settlements belonging to this house
  data.settlements = data.settlements.filter(function (settlement) {
    return settlement.houseId !== selectedHouseId;
  });

  // Remove activities belonging to this house
  data.activities = data.activities.filter(function (activity) {
    return activity.houseId !== selectedHouseId;
  });

  saveData(data);

  selectedHouseId = null;

  showMessage(
    formMessage,
    'House deleted successfully.',
    'text-success'
  );

  displayHouseOptions();
  displayHouses();
  displayMembers();
});


// ADD A MEMBER
addMemberForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const houseId = Number(memberHouseInput.value);
  const memberName = memberNameInput.value.trim();

  if (memberHouseInput.value === '' || memberName === '') {
    showMessage(
      memberMessage,
      "Please select a house and enter the member's name.",
      'text-danger'
    );
    return;
  }

  const data = getData();

  // Check that the selected house exists
  const selectedHouse = data.houses.find(function (house) {
    return house.id === houseId;
  });

  if (!selectedHouse) {
    showMessage(
      memberMessage,
      'Please select a valid house.',
      'text-danger'
    );
    return;
  }

  // Prevent duplicate member names in the same house
  const memberExists = data.members.some(function (member) {
    return (
      member.houseId === houseId &&
      member.name.toLowerCase() === memberName.toLowerCase()
    );
  });

  if (memberExists) {
    showMessage(
      memberMessage,
      'This member already exists in the selected house.',
      'text-danger'
    );
    return;
  }

  // Create the new member
  const newMember = {
    id: Date.now(),
    name: memberName,
    houseId: houseId,
    createdAt: new Date().toISOString()
  };

  data.members.push(newMember);

  // Add the member ID to the house
  if (!Array.isArray(selectedHouse.memberIds)) {
    selectedHouse.memberIds = [];
  }

  selectedHouse.memberIds.push(newMember.id);

  saveData(data);

  // Select the house where the member was added
  selectedHouseId = houseId;

  addMemberForm.reset();

  showMessage(
    memberMessage,
    'Member added successfully!',
    'text-success'
  );

  displayHouseOptions();
  displayHouses();
  displayMembers();
});


// CHANGE HOUSE FROM THE DROPDOWN
memberHouseInput.addEventListener('change', function () {
  if (memberHouseInput.value === '') {
    selectedHouseId = null;
  } else {
    selectedHouseId = Number(memberHouseInput.value);
  }

  deleteHouseButton.disabled = selectedHouseId === null;

  displayHouses();
  displayMembers();
});


// EDIT A MEMBER
function editMember(memberId) {
  const data = getData();

  const member = data.members.find(function (item) {
    return item.id === memberId;
  });

  if (!member) {
    return;
  }

  const newName = prompt(
    "Enter the member's new name:",
    member.name
  );

  if (newName === null) {
    return;
  }

  const cleanedName = newName.trim();

  if (cleanedName === '') {
    alert('The member name cannot be empty.');
    return;
  }

  // Prevent duplicate names in the same house
  const duplicateName = data.members.some(function (item) {
    return (
      item.id !== memberId &&
      item.houseId === member.houseId &&
      item.name.toLowerCase() === cleanedName.toLowerCase()
    );
  });

  if (duplicateName) {
    alert('Another member in this house already has that name.');
    return;
  }

  member.name = cleanedName;

  saveData(data);

  showMessage(
    memberMessage,
    'Member name updated successfully.',
    'text-success'
  );

  displayHouses();
  displayMembers();
}


// DELETE A MEMBER
function deleteMember(memberId) {
  const data = getData();

  const member = data.members.find(function (item) {
    return item.id === memberId;
  });

  if (!member) {
    return;
  }

  // Check whether the member appears in expense records
  const memberHasExpenses = data.expenses.some(function (expense) {
    const participants = expense.participants || [];

    return (
      Number(expense.paidBy) === memberId ||
      Number(expense.payerId) === memberId ||
      participants.some(function (participant) {
        if (typeof participant === 'object' && participant !== null) {
          return Number(participant.memberId) === memberId;
        }

        return Number(participant) === memberId;
      })
    );
  });

  // Keep members who appear in existing expense records
  if (memberHasExpenses) {
    alert(
      'This member appears in expense records. Review their expenses and outstanding balance before deleting them.'
    );
    return;
  }

  const answer = confirm(
    'Are you sure you want to delete ' + member.name + '?'
  );

  if (!answer) {
    return;
  }

  // Remove the member
  data.members = data.members.filter(function (item) {
    return item.id !== memberId;
  });

  // Remove the member ID from each house
  data.houses.forEach(function (house) {
    house.memberIds = (house.memberIds || []).filter(function (id) {
      return id !== memberId;
    });
  });

  saveData(data);

  showMessage(
    memberMessage,
    'Member deleted successfully.',
    'text-success'
  );

  displayHouses();
  displayMembers();
}


// INITIALIZE THE PAGE
async function startPage() {
  try {
    await initializeData();

    displayHouseOptions();
    displayHouses();
    displayMembers();
  } catch (error) {
    console.error('Unable to load houses and members:', error);

    housesList.textContent =
      'Unable to load your houses. Please refresh the page.';
  }
}

startPage();

