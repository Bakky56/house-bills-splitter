
import { getData, saveData } from './storage.js';
import { initializeData } from '../data.js';

// HOUSE ELEMENTS
const createHouseForm = document.getElementById('createHouseForm');
const houseNameInput = document.getElementById('houseName');
const houseAddressInput = document.getElementById('houseAddress');
const deleteHouseButton = document.getElementById('deleteHouseButton');
const housesList = document.getElementById('housesList');
const houseCountElement = document.getElementById('houseCount');

// MEMBER ELEMENTS
const addMemberForm = document.getElementById('addMemberForm');
const memberHouseInput = document.getElementById('memberHouse');
const memberNameInput = document.getElementById('memberName');
const membersList = document.getElementById('membersList');

// TOAST ELEMENTS
const messageToast = document.getElementById('messageToast');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');

// EDIT MEMBER MODAL ELEMENTS
const editMemberModalElement = document.getElementById('editMemberModal');
const editMemberForm = document.getElementById('editMemberForm');
const editMemberNameInput = document.getElementById('editMemberName');
const editMemberMessage = document.getElementById('editMemberMessage');

// CREATE THE BOOTSTRAP TOAST AND MODAL
const editMemberModal = new bootstrap.Modal(editMemberModalElement);

// STORE THE IDs
let selectedHouseId = null;
let editingMemberId = null;
let deletingHouseId = null;
let deletingMemberId = null;


// SHOW TOAST MESSAGE
function showMessage(message, type = 'success') {
  toastMessage.textContent = message;

  if (type === 'success') {
    toastTitle.textContent = 'Success';

    messageToast.classList.remove('toast-error');
    messageToast.classList.add('toast-success');
  } else {
    toastTitle.textContent = 'Notice';

    messageToast.classList.remove('toast-success');
    messageToast.classList.add('toast-error');
  }

  const toast = bootstrap.Toast.getOrCreateInstance(messageToast);

  toast.show();
}


// DISPLAY ALL HOUSES
function displayHouses() {
  const data = getData();
  const houses = data.houses || [];

  // Update the house count
  houseCountElement.textContent =
    houses.length + (houses.length === 1 ? ' house' : ' houses');

  // Clear the current list
  housesList.innerHTML = '';

  // Check whether there are houses
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

  // Check whether the selected house still exists
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

    // HOUSE INFORMATION
    const houseDetails = document.createElement('div');

    const houseTitle = document.createElement('h3');

    houseTitle.className = 'h5 fw-bold mb-2';
    houseTitle.textContent = house.name;

    const houseAddress = document.createElement('p');

    houseAddress.className = 'text-muted mb-2';
    houseAddress.textContent = house.address;

    // Count members in this house
    const houseMembers = (data.members || []).filter(function (member) {
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

    // SELECT HOUSE BUTTON
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

  // Enable delete only when a house is selected
  deleteHouseButton.disabled = selectedHouseId === null;

  // Keep the dropdown in sync with the selected house
  memberHouseInput.value =
    selectedHouseId === null ? '' : selectedHouseId;
}


// FILL THE HOUSE DROPDOWN
function displayHouseOptions() {
  const data = getData();

  memberHouseInput.innerHTML = `
    <option value="">Choose a house</option>
  `;

  (data.houses || []).forEach(function (house) {
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
  const selectedHouse = (data.houses || []).find(function (house) {
    return house.id === selectedHouseId;
  });

  if (!selectedHouse) {
    selectedHouseId = null;

    displayHouseOptions();
    displayHouses();
    displayMembers();

    return;
  }

  // Display the selected house name
  const heading = document.createElement('h3');

  heading.className = 'h5 fw-bold mb-3';
  heading.textContent = selectedHouse.name + ' — Members';

  membersList.appendChild(heading);

  // Get members belonging to this house
  const houseMembers = (data.members || []).filter(function (member) {
    return member.houseId === selectedHouseId;
  });

  // Check whether the house has members
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

    // EDIT AND DELETE BUTTONS
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
    showMessage('Please enter the house name and address.', 'error');

    return;
  }

  const data = getData();

  // Prevent duplicate house names
  const houseExists = (data.houses || []).some(function (house) {
    return house.name.toLowerCase() === houseName.toLowerCase();
  });

  if (houseExists) {
    showMessage('A house with this name already exists.', 'error');

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

  displayHouseOptions();
  displayHouses();
  displayMembers();

  showMessage('House created successfully!', 'success');
});


// DELETE A HOUSE
deleteHouseButton.addEventListener('click', function () {
  if (selectedHouseId === null) {
    showMessage('Please select a house first.', 'error');

    return;
  }

  const data = getData();

  // Prevent deleting houses that have expenses
  const houseExpenses = (data.expenses || []).filter(function (expense) {
    return Number(expense.houseId) === Number(selectedHouseId);
  });

  if (houseExpenses.length > 0) {
    showMessage(
      'This house has expense records. Review them before deleting the house.',
      'error'
    );

    return;
  }

  // Open the confirmation modal instead of using confirm()
  deletingHouseId = selectedHouseId;

  const confirmationTitle = document.getElementById('confirmationTitle');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const confirmationButton = document.getElementById('confirmationButton');
  const confirmationModalElement = document.getElementById('confirmationModal');

  // If the optional confirmation modal is not in the HTML,
  // delete the house immediately and notify the user.
  if (
    !confirmationModalElement ||
    !confirmationTitle ||
    !confirmationMessage ||
    !confirmationButton
  ) {
    deleteHouse(deletingHouseId);

    return;
  }

  confirmationTitle.textContent = 'Delete House';
  confirmationMessage.textContent =
    'Are you sure you want to delete this house and its members?';

  confirmationButton.textContent = 'Delete House';
  confirmationButton.className = 'btn btn-danger';

  const confirmationModal =
    bootstrap.Modal.getOrCreateInstance(confirmationModalElement);

  confirmationModal.show();
});


// REMOVE A HOUSE
function deleteHouse(houseId) {
  const data = getData();

  // Check for expenses again before deleting
  const houseHasExpenses = (data.expenses || []).some(function (expense) {
    return Number(expense.houseId) === Number(houseId);
  });

  if (houseHasExpenses) {
    showMessage(
      'This house has expense records. Review them before deleting the house.',
      'error'
    );

    return;
  }

  // Remove the house
  data.houses = (data.houses || []).filter(function (house) {
    return house.id !== houseId;
  });

  // Remove members belonging to this house
  data.members = (data.members || []).filter(function (member) {
    return member.houseId !== houseId;
  });

  // Remove settlements belonging to this house
  data.settlements = (data.settlements || []).filter(function (settlement) {
    return settlement.houseId !== houseId;
  });

  // Remove activities belonging to this house
  data.activities = (data.activities || []).filter(function (activity) {
    return activity.houseId !== houseId;
  });

  saveData(data);

  selectedHouseId = null;
  deletingHouseId = null;

  displayHouseOptions();
  displayHouses();
  displayMembers();

  showMessage('House deleted successfully.', 'success');
}


// ADD A MEMBER
addMemberForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const houseId = Number(memberHouseInput.value);
  const memberName = memberNameInput.value.trim();

  if (memberHouseInput.value === '' || memberName === '') {
    showMessage(
      "Please select a house and enter the member's name.",
      'error'
    );

    return;
  }

  const data = getData();

  // Check that the selected house exists
  const selectedHouse = (data.houses || []).find(function (house) {
    return Number(house.id) === houseId;
  });

  if (!selectedHouse) {
    showMessage('Please select a valid house.', 'error');

    return;
  }

  // Prevent duplicate member names in the same house
  const memberExists = (data.members || []).some(function (member) {
    return (
      Number(member.houseId) === houseId &&
      member.name.toLowerCase() === memberName.toLowerCase()
    );
  });

  if (memberExists) {
    showMessage(
      'This member already exists in the selected house.',
      'error'
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

  displayHouseOptions();
  displayHouses();
  displayMembers();

  showMessage('Member added successfully!', 'success');
});


// CHANGE HOUSE FROM THE DROPDOWN
memberHouseInput.addEventListener('change', function () {
  if (memberHouseInput.value === '') {
    selectedHouseId = null;
  } else {
    selectedHouseId = Number(memberHouseInput.value);
  }

  displayHouses();
  displayMembers();
});


// OPEN THE EDIT MEMBER MODAL
function editMember(memberId) {
  const data = getData();

  const member = (data.members || []).find(function (item) {
    return Number(item.id) === Number(memberId);
  });

  if (!member) {
    showMessage('Member not found.', 'error');

    return;
  }

  editingMemberId = memberId;

  editMemberNameInput.value = member.name;
  editMemberMessage.textContent = '';

  editMemberModal.show();
}


// SAVE MEMBER EDITS
editMemberForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const newName = editMemberNameInput.value.trim();

  if (newName === '') {
    editMemberMessage.textContent = 'Please enter a member name.';

    return;
  }

  const data = getData();

  const member = (data.members || []).find(function (item) {
    return Number(item.id) === Number(editingMemberId);
  });

  if (!member) {
    editMemberMessage.textContent = 'Member not found.';

    return;
  }

  // Prevent duplicate names in the same house
  const duplicateName = (data.members || []).some(function (item) {
    return (
      Number(item.id) !== Number(editingMemberId) &&
      Number(item.houseId) === Number(member.houseId) &&
      item.name.toLowerCase() === newName.toLowerCase()
    );
  });

  if (duplicateName) {
    editMemberMessage.textContent =
      'Another member in this house already has that name.';

    return;
  }

  // Update the member name
  member.name = newName;

  saveData(data);

  editMemberModal.hide();

  displayHouses();
  displayMembers();

  showMessage('Member name updated successfully!', 'success');

  editingMemberId = null;
});


// DELETE A MEMBER
function deleteMember(memberId) {
  const data = getData();

  const member = (data.members || []).find(function (item) {
    return Number(item.id) === Number(memberId);
  });

  if (!member) {
    showMessage('Member not found.', 'error');

    return;
  }

  // Check whether the member appears in expense records
  const memberHasExpenses = (data.expenses || []).some(function (expense) {
    const participants = expense.participants || [];

    return (
      Number(expense.paidBy) === Number(memberId) ||
      Number(expense.payerId) === Number(memberId) ||
      participants.some(function (participant) {
        if (typeof participant === 'object' && participant !== null) {
          return Number(participant.memberId) === Number(memberId);
        }

        return Number(participant) === Number(memberId);
      })
    );
  });

  // Keep members who appear in expense records
  if (memberHasExpenses) {
    showMessage(
      'This member appears in expense records. Review their expenses and outstanding balance before deleting them.',
      'error'
    );

    return;
  }

  // Open the optional confirmation modal
  deletingMemberId = memberId;

  const confirmationTitle = document.getElementById('confirmationTitle');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const confirmationButton = document.getElementById('confirmationButton');
  const confirmationModalElement = document.getElementById('confirmationModal');

  // If the confirmation modal is not in the HTML, delete immediately
  if (
    !confirmationModalElement ||
    !confirmationTitle ||
    !confirmationMessage ||
    !confirmationButton
  ) {
    removeMember(deletingMemberId);

    return;
  }

  confirmationTitle.textContent = 'Delete Member';
  confirmationMessage.textContent =
    'Are you sure you want to delete ' + member.name + '?';

  confirmationButton.textContent = 'Delete Member';
  confirmationButton.className = 'btn btn-danger';

  const confirmationModal =
    bootstrap.Modal.getOrCreateInstance(confirmationModalElement);

  confirmationModal.show();
}


// REMOVE A MEMBER
function removeMember(memberId) {
  const data = getData();

  // Check the member again
  const member = (data.members || []).find(function (item) {
    return Number(item.id) === Number(memberId);
  });

  if (!member) {
    showMessage('Member not found.', 'error');

    return;
  }

  // Check whether the member has any expense records
  const memberHasExpenses = (data.expenses || []).some(function (expense) {
    const participants = expense.participants || [];

    return (
      Number(expense.paidBy) === Number(memberId) ||
      Number(expense.payerId) === Number(memberId) ||
      participants.some(function (participant) {
        if (typeof participant === 'object' && participant !== null) {
          return Number(participant.memberId) === Number(memberId);
        }

        return Number(participant) === Number(memberId);
      })
    );
  });

  if (memberHasExpenses) {
    showMessage(
      'This member appears in expense records. Review them before deleting the member.',
      'error'
    );

    return;
  }

  // Remove the member
  data.members = data.members.filter(function (item) {
    return Number(item.id) !== Number(memberId);
  });

  // Remove the member ID from each house
  (data.houses || []).forEach(function (house) {
    house.memberIds = (house.memberIds || []).filter(function (id) {
      return Number(id) !== Number(memberId);
    });
  });

  saveData(data);

  deletingMemberId = null;

  displayHouses();
  displayMembers();

  showMessage('Member deleted successfully.', 'success');
}


// HANDLE THE OPTIONAL CONFIRMATION MODAL
const confirmationButton = document.getElementById('confirmationButton');
const confirmationModalElement = document.getElementById('confirmationModal');

if (confirmationButton && confirmationModalElement) {
  confirmationButton.addEventListener('click', function () {
    const confirmationModal =
      bootstrap.Modal.getOrCreateInstance(confirmationModalElement);

    confirmationModal.hide();

    if (deletingHouseId !== null) {
      deleteHouse(deletingHouseId);
    } else if (deletingMemberId !== null) {
      removeMember(deletingMemberId);
    }
  });

  // Clear pending actions if the user closes the confirmation modal
  confirmationModalElement.addEventListener('hidden.bs.modal', function () {
    deletingHouseId = null;
    deletingMemberId = null;
  });
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

    showMessage('Unable to load your houses. Please refresh the page.', 'error');
  }
}

startPage();

