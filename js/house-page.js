import { getData, saveData } from '../js/storage.js';

const createHouseForm = document.getElementById('createHouseForm');
const houseNameInput = document.getElementById('houseName');
const houseAddressInput = document.getElementById('houseAddress');
const deleteHouseButton = document.getElementById('deleteHouseButton');
const housesList = document.getElementById('housesList');
const formMessage = document.getElementById('formMessage');

const addMemberForm = document.getElementById('addMemberForm');
const memberHouseInput = document.getElementById('memberHouse');
const memberNameInput = document.getElementById('memberName');
const memberMessage = document.getElementById('memberMessage');
const membersList = document.getElementById('membersList');

let selectedHouseId = null;

function displayHouses() {
  const data = getData();
  const houses = data ? data.houses : [];

  housesList.innerHTML = '';

  if (houses.length === 0) {
    housesList.textContent = "You haven't created any houses yet.";
    deleteHouseButton.disabled = true;
    selectedHouseId = null;
    return;
  }

  houses.forEach(function (house) {
    const houseCard = document.createElement('div');
    houseCard.className = 'card shadow-sm border-0 mb-3';

    const cardBody = document.createElement('div');
    cardBody.className =
      'card-body d-flex justify-content-between align-items-center gap-3';

    const houseTitle = document.createElement('h3');
    houseTitle.className = 'h5 fw-bold mb-1';
    houseTitle.textContent = house.name;

    const houseAddress = document.createElement('p');
    houseAddress.className = 'text-muted mb-0';
    houseAddress.textContent = house.address;

    const houseDetails = document.createElement('div');
    houseDetails.appendChild(houseTitle);
    houseDetails.appendChild(houseAddress);

    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'btn btn-outline-primary';
    selectButton.textContent = 'Select';

    selectButton.addEventListener('click', function () {
      selectedHouseId = house.id;
      memberHouseInput.value = house.id;

      deleteHouseButton.disabled = false;

      displayHouses();
      displayMembers();
    });

    if (selectedHouseId === house.id) {
      selectButton.textContent = 'Selected';
      selectButton.className = 'btn btn-primary';
    }

    cardBody.appendChild(houseDetails);
    cardBody.appendChild(selectButton);
    houseCard.appendChild(cardBody);
    housesList.appendChild(houseCard);
  });

  if (selectedHouseId === null) {
    deleteHouseButton.disabled = true;
  } else {
    deleteHouseButton.disabled = false;
  }
}

function displayHouseOptions() {
  const data = getData();

  memberHouseInput.innerHTML = '<option value="">Choose a house</option>';

  if (data === null || data.houses.length === 0) {
    return;
  }

  data.houses.forEach(function (house) {
    const option = document.createElement('option');

    option.value = house.id;
    option.textContent = house.name;

    memberHouseInput.appendChild(option);
  });
}

function displayMembers() {
  const data = getData();

  membersList.innerHTML = '';

  if (selectedHouseId === null) {
    membersList.textContent = 'Select a house to view its members.';
    return;
  }

  if (data === null) {
    membersList.textContent = 'No members found.';
    return;
  }

  const members = data.members.filter(function (member) {
    return member.houseId === selectedHouseId;
  });

  if (members.length === 0) {
    membersList.textContent = 'No members have been added to this house yet.';
    return;
  }

  members.forEach(function (member) {
    const memberCard = document.createElement('div');
    memberCard.className = 'card shadow-sm border-0 mb-2';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const memberName = document.createElement('p');
    memberName.className = 'fw-semibold mb-0';
    memberName.textContent = member.name;

    cardBody.appendChild(memberName);
    memberCard.appendChild(cardBody);
    membersList.appendChild(memberCard);
  });
}

createHouseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const houseName = houseNameInput.value.trim();
  const houseAddress = houseAddressInput.value.trim();

  if (houseName === '' || houseAddress === '') {
    formMessage.textContent = 'Please enter the house name and address.';
    formMessage.className = 'text-danger mb-3';
    return;
  }

  try {
    let data = getData();

    if (data === null) {
      data = {
        houses: [],
        members: [],
        expenses: [],
        settlements: [],
        activities: [],
      };
    }

    const newHouse = {
      id: Date.now(),
      name: houseName,
      address: houseAddress,
      memberIds: [],
      createdAt: new Date().toISOString(),
    };

    data.houses.push(newHouse);

    saveData(data);

    formMessage.textContent = 'House created successfully!';
    formMessage.className = 'text-success mb-3';

    createHouseForm.reset();

    displayHouses();
    displayHouseOptions();
  } catch (error) {
    console.log(error);

    formMessage.textContent = 'Unable to create the house. Please try again.';
    formMessage.className = 'text-danger mb-3';
  }
});

deleteHouseButton.addEventListener('click', function () {
  if (selectedHouseId === null) {
    formMessage.textContent = 'Please select a house to delete.';
    formMessage.className = 'text-danger mb-3';
    return;
  }

  const answer = confirm(
    'Are you sure you want to delete this house and its members and records?',
  );

  if (answer === false) {
    return;
  }

  try {
    const data = getData();

    if (data === null) {
      return;
    }

    data.houses = data.houses.filter(function (house) {
      return house.id !== selectedHouseId;
    });

    data.members = data.members.filter(function (member) {
      return member.houseId !== selectedHouseId;
    });

    data.expenses = data.expenses.filter(function (expense) {
      return expense.houseId !== selectedHouseId;
    });

    data.settlements = data.settlements.filter(function (settlement) {
      return settlement.houseId !== selectedHouseId;
    });

    data.activities = data.activities.filter(function (activity) {
      return activity.houseId !== selectedHouseId;
    });

    saveData(data);

    selectedHouseId = null;

    formMessage.textContent = 'House deleted successfully!';
    formMessage.className = 'text-success mb-3';

    displayHouses();
    displayHouseOptions();
    displayMembers();
  } catch (error) {
    console.log(error);

    formMessage.textContent = 'Unable to delete the house. Please try again.';
    formMessage.className = 'text-danger mb-3';
  }
});

addMemberForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const houseId = Number(memberHouseInput.value);
  const memberName = memberNameInput.value.trim();

  if (memberHouseInput.value === '') {
    memberMessage.textContent = 'Please select a house.';
    memberMessage.className = 'text-danger mb-3';
    return;
  }

  if (memberName === '') {
    memberMessage.textContent = 'Please enter the member name.';
    memberMessage.className = 'text-danger mb-3';
    return;
  }

  try {
    const data = getData();

    if (data === null) {
      memberMessage.textContent = 'Please create a house first.';
      memberMessage.className = 'text-danger mb-3';
      return;
    }

    const newMember = {
      id: Date.now(),
      name: memberName,
      houseId: houseId,
      createdAt: new Date().toISOString(),
    };

    data.members.push(newMember);

    const selectedHouse = data.houses.find(function (house) {
      return house.id === houseId;
    });

    if (selectedHouse) {
      selectedHouse.memberIds.push(newMember.id);
    }

    saveData(data);

    selectedHouseId = houseId;

    memberMessage.textContent = 'Member added successfully!';
    memberMessage.className = 'text-success mb-3';

    addMemberForm.reset();

    displayHouses();
    displayMembers();
  } catch (error) {
    console.log(error);

    memberMessage.textContent = 'Unable to add the member. Please try again.';
    memberMessage.className = 'text-danger mb-3';
  }
});

memberHouseInput.addEventListener('change', function () {
  if (memberHouseInput.value === '') {
    selectedHouseId = null;
  } else {
    selectedHouseId = Number(memberHouseInput.value);
  }

  displayHouses();
  displayMembers();
});

displayHouses();
displayHouseOptions();
displayMembers();
