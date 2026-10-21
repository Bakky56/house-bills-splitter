import { getData, saveData } from '../js/storage.js';

let exchangeRates = {};

const expenseForm = document.querySelector('#expenseForm');
const expenseTitle = document.querySelector('#expenseTitle');
const expenseAmount = document.querySelector('#expenseAmount');
const expenseCategory = document.querySelector('#expenseCategory');
const houseSelect = document.querySelector('#expenseHouse');
const expenseDate = document.querySelector('#expenseDate');
const expensePayer = document.querySelector('#expensePayer');
const memberList = document.querySelector('#memberList');
const selectedMembersCount = document.querySelector('#selectedMembersCount');
const selectNoneBtn = document.querySelector('#selectNoneBtn');
const splitTypeInput = document.querySelector('#splitType');
const splitButtons = document.querySelectorAll('.split-tab');
const splitHelp = document.querySelector('#splitHelp');
const reconciliationStatus = document.querySelector('#reconciliationStatus');
const formMessage = document.querySelector('#formMessage');

const previewHouseLabel = document.querySelector('#previewHouseLabel');
const previewHouseName = document.querySelector('#previewHouseName');
const previewMemberCount = document.querySelector('#previewMemberCount');
const previewTotal = document.querySelector('#previewTotal');
const summaryTotal = document.querySelector('#summaryTotal');
const summaryMembers = document.querySelector('#summaryMembers');
const summaryShare = document.querySelector('#summaryShare');

let memberCheckboxes = [];
let appData = getData() || {
  houses: [],
  members: [],
  expenses: [],
  settlements: [],
  activities: [],
};

let selectedHouseId = '';

function getLatestData() {
  return (
    getData() || {
      houses: [],
      members: [],
      expenses: [],
      settlements: [],
      activities: [],
    }
  );
}

function showMessage(message, type = 'success') {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function currencyFormatter(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function displayHouseOptions() {
  appData = getLatestData();

  houseSelect.innerHTML = '<option value="">Select a house</option>';

  appData.houses.forEach(function (house) {
    const option = document.createElement('option');
    option.value = house.id;
    option.textContent = house.name;

    houseSelect.appendChild(option);
  });

  if (appData.houses.length === 0) {
    showMessage('Create a house before adding an expense.', 'error');
  }
}

function getSelectedMembers() {
  return memberCheckboxes.filter(function (checkbox) {
    return checkbox.checked;
  });
}

function updateSelectedMembersCount() {
  const count = getSelectedMembers().length;

  selectedMembersCount.textContent = `${count} MEMBERS SELECTED`;
  previewMemberCount.textContent = `${count} members selected`;
  summaryMembers.textContent = count;
}

function displayHouseMembers() {
  appData = getLatestData();

  selectedHouseId = houseSelect.value;

  expensePayer.innerHTML = '<option value="">Select a member</option>';
  expensePayer.disabled = true;

  memberList.innerHTML = '';
  memberCheckboxes = [];

  const house = appData.houses.find(function (item) {
    return String(item.id) === String(selectedHouseId);
  });

  if (!house) {
    previewHouseLabel.textContent = 'No house selected';
    previewHouseName.textContent = 'Choose a house';
    previewMemberCount.textContent = '0 members selected';

    showEmptyMembers();
    updatePreview();

    return;
  }

  previewHouseLabel.textContent = house.name;
  previewHouseName.textContent = house.name;

  const members = appData.members.filter(function (member) {
    return String(member.houseId) === String(house.id);
  });

  if (members.length === 0) {
    showEmptyMembers();
    updatePreview();
    updateSelectedMembersCount();

    return;
  }

  expensePayer.disabled = false;

  members.forEach(function (member) {
    const payerOption = document.createElement('option');

    payerOption.value = member.id;
    payerOption.textContent = member.name;

    expensePayer.appendChild(payerOption);

    const memberRow = document.createElement('div');
    memberRow.className = 'member-row';

    const nameLabel = document.createElement('label');

    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.className = 'member-checkbox';
    checkbox.value = member.id;
    checkbox.checked = true;

    const nameText = document.createElement('span');
    nameText.textContent = member.name;

    nameLabel.appendChild(checkbox);
    nameLabel.appendChild(nameText);

    const shareElement = document.createElement('span');

    shareElement.dataset.share = member.id;
    shareElement.textContent = currencyFormatter(0);

    const shareLabel = document.createElement('small');

    shareLabel.dataset.shareLabel = member.id;
    shareLabel.textContent = '0% share';

    memberRow.appendChild(nameLabel);
    memberRow.appendChild(shareElement);
    memberRow.appendChild(shareLabel);

    memberList.appendChild(memberRow);

    memberCheckboxes.push(checkbox);

    checkbox.addEventListener('change', function () {
      updateSelectedMembersCount();
      calculateSplit();
    });
  });

  updateSelectedMembersCount();
  calculateSplit();
}

function showEmptyMembers() {
  memberList.innerHTML = `     <div class="empty-members">       <i class="fa-solid fa-users"></i>       <p>Select a house with members to share this expense.</p>     </div>
  `;

  selectedMembersCount.textContent = '0 MEMBERS SELECTED';
  summaryMembers.textContent = '0';
}

function updatePreview() {
  const amount = Number(expenseAmount.value) || 0;

  previewTotal.textContent = `Total expense: ${currencyFormatter(amount)}`;
  summaryTotal.textContent = currencyFormatter(amount);
}

function getMemberShares() {
  const amount = Number(expenseAmount.value) || 0;
  const selectedMembers = getSelectedMembers();

  if (selectedMembers.length === 0) {
    return [];
  }

  const splitType = splitTypeInput.value;
  const shares = [];

  if (splitType === 'equal') {
    const shareInKobo = Math.round(amount * 100);
    const baseShare = Math.floor(shareInKobo / selectedMembers.length);
    let remainder = shareInKobo - baseShare * selectedMembers.length;

    selectedMembers.forEach(function (checkbox) {
      let memberShare = baseShare;

      if (remainder > 0) {
        memberShare++;
        remainder--;
      }

      shares.push({
        memberId: checkbox.value,
        amount: memberShare / 100,
        percentage: amount > 0 ? (memberShare / shareInKobo) * 100 : 0,
      });
    });
  }

  if (splitType === 'exact' || splitType === 'percentage') {
    selectedMembers.forEach(function (checkbox) {
      const input = memberList.querySelector(
        `[data-input="${checkbox.value}"]`,
      );

      const enteredValue = input ? Number(input.value) : 0;

      const memberShare =
        splitType === 'exact' ? enteredValue : (amount * enteredValue) / 100;

      shares.push({
        memberId: checkbox.value,
        amount: Math.round(memberShare * 100) / 100,
        percentage:
          splitType === 'percentage'
            ? enteredValue
            : amount > 0
              ? (memberShare / amount) * 100
              : 0,
      });
    });
  }

  return shares;
}

function updateSplitInputs() {
  const splitType = splitTypeInput.value;

  memberCheckboxes.forEach(function (checkbox) {
    const memberRow = checkbox.closest('.member-row');

    if (!memberRow) {
      return;
    }

    let input = memberRow.querySelector('[data-input]');

    if (splitType === 'equal') {
      if (input) {
        input.remove();
      }

      return;
    }

    if (!input) {
      input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.01';
      input.className = 'form-control expense-input member-share-input';
      input.dataset.input = checkbox.value;

      input.addEventListener('input', calculateSplit);

      memberRow.appendChild(input);
    }

    input.max = splitType === 'percentage' ? '100' : '';
    input.placeholder =
      splitType === 'percentage' ? 'Percentage %' : 'Amount ₦';
  });

  if (splitType === 'equal') {
    splitHelp.textContent =
      'The expense will be shared equally among selected members.';
  } else if (splitType === 'exact') {
    splitHelp.textContent =
      "Enter each member's share. The amounts must add up to the total expense.";
  } else {
    splitHelp.textContent =
      "Enter each member's percentage. The percentages must add up to 100%.";
  }

  calculateSplit();
}

function calculateSplit() {
  const amount = Number(expenseAmount.value) || 0;
  const shares = getMemberShares();

  let totalShares = 0;
  let totalPercentage = 0;

  shares.forEach(function (share) {
    totalShares += share.amount;
    totalPercentage += share.percentage;
  });

  memberCheckboxes.forEach(function (checkbox) {
    const shareElement = memberList.querySelector(
      `[data-share="${checkbox.value}"]`,
    );

    const shareLabel = memberList.querySelector(
      `[data-share-label="${checkbox.value}"]`,
    );

    if (!shareElement || !shareLabel) {
      return;
    }

    const share = shares.find(function (item) {
      return String(item.memberId) === String(checkbox.value);
    });

    shareElement.textContent = currencyFormatter(share ? share.amount : 0);

    shareLabel.textContent =
      checkbox.checked && share
        ? `${share.percentage.toFixed(2)}% share`
        : 'Not included';
  });

  if (splitTypeInput.value === 'equal') {
    summaryShare.textContent = shares.length
      ? currencyFormatter(amount / shares.length)
      : currencyFormatter(0);
  } else {
    summaryShare.textContent = shares.length
      ? currencyFormatter(totalShares / shares.length)
      : currencyFormatter(0);
  }

  updatePreview();

  let valid = false;

  if (shares.length > 0 && amount > 0) {
    if (splitTypeInput.value === 'equal') {
      valid = true;
    } else if (splitTypeInput.value === 'exact') {
      valid = Math.round(totalShares * 100) === Math.round(amount * 100);
    } else {
      valid = Math.abs(totalPercentage - 100) < 0.01;
    }
  }

  if (valid) {
    reconciliationStatus.textContent = 'Split verified';
  } else {
    reconciliationStatus.textContent = 'Check split';
  }

  return valid;
}

splitButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    splitButtons.forEach(function (item) {
      item.classList.remove('active');
    });

    button.classList.add('active');
    splitTypeInput.value = button.dataset.split;

    updateSplitInputs();
  });
});

houseSelect.addEventListener('change', function () {
  formMessage.textContent = '';
  displayHouseMembers();
});

expenseAmount.addEventListener('input', calculateSplit);

selectNoneBtn.addEventListener('click', function () {
  memberCheckboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  updateSelectedMembersCount();
  calculateSplit();
});

expenseForm.addEventListener('reset', function () {
  setTimeout(function () {
    splitTypeInput.value = 'equal';

    splitButtons.forEach(function (button) {
      button.classList.toggle('active', button.dataset.split === 'equal');
    });

    displayHouseMembers();
    updateSplitInputs();

    formMessage.textContent = '';
  }, 0);
});

expenseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  appData = getLatestData();

  const houseId = houseSelect.value;
  const title = expenseTitle.value.trim();
  const amount = Number(expenseAmount.value);
  const category = expenseCategory.value;
  const date = expenseDate.value;
  const paidBy = expensePayer.value;
  const selectedMembers = getSelectedMembers();

  if (!houseId || !title || !category || !date || !paidBy) {
    showMessage('Please complete all required fields.', 'error');
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    showMessage('Enter an expense amount greater than zero.', 'error');
    return;
  }

  if (selectedMembers.length === 0) {
    showMessage('Select at least one member to share the expense.', 'error');
    return;
  }

  const house = appData.houses.find(function (item) {
    return String(item.id) === String(houseId);
  });

  const payer = appData.members.find(function (member) {
    return (
      String(member.id) === String(paidBy) &&
      String(member.houseId) === String(houseId)
    );
  });

  if (!house || !payer) {
    showMessage('The selected house or payer is invalid.', 'error');
    return;
  }

  const valid = calculateSplit();

  if (!valid) {
    showMessage(
      'Please check the split. Exact amounts must equal the total, and percentages must equal 100%.',
      'error',
    );
    return;
  }

  const shares = getMemberShares();

  const expense = {
    id: Date.now(),
    houseId: house.id,
    title: title,
    amount: Math.round(amount * 100) / 100,
    category: category,
    date: date,
    paidBy: payer.id,
    participants: shares.map(function (share) {
      return share.memberId;
    }),
    splitType: splitTypeInput.value,
    splits: shares.map(function (share) {
      return {
        memberId: share.memberId,
        amount: share.amount,
        percentage: share.percentage,
      };
    }),
  };

  appData.expenses.push(expense);

  appData.activities.push({
    id: Date.now() + 1,
    houseId: house.id,
    type: 'expense',
    description: `${payer.name} added ${title}`,
    date: new Date().toISOString(),
  });

  try {
    saveData(appData);

    showMessage('Expense saved successfully!', 'success');

    expenseForm.reset();
    houseSelect.value = '';
    displayHouseMembers();
    displayHouseOptions();
    houseSelect.value = '';

    previewHouseLabel.textContent = 'No house selected';
    previewHouseName.textContent = 'Choose a house';

    updatePreview();
  } catch (error) {
    console.error('Unable to save expense:', error);
    appData = getLatestData();
    showMessage('Unable to save the expense. Please try again.', 'error');
  }
});

displayHouseOptions();
displayHouseMembers();
updateSelectedMembersCount();
updatePreview();
