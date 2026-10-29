const links = [
  { href: 'index.html', icon: 'fa-chart-pie', label: 'Dashboard' },
  {
    href: 'house-member.html',
    icon: 'fa-people-roof',
    label: 'Houses & Members',
  },
  { href: 'expenses.html', icon: 'fa-receipt', label: 'Expenses' },
  { href: 'balances.html', icon: 'fa-scale-balanced', label: 'Balances' },
  {
    href: 'settlements.html',
    icon: 'fa-money-bill-transfer',
    label: 'Settlements',
  },
  {
    href: 'activity.html',
    icon: 'fa-clock-rotate-left',
    label: 'Activity History',
  },
];

function showAppToast(message, type = 'success') {
  let container = document.getElementById('appToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'appToastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '2000';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const kind =
    type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success';
  toast.className =
    'toast align-items-center text-bg-' + kind + ' border-0 mb-2';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');

  const row = document.createElement('div');
  row.className = 'd-flex';
  const body = document.createElement('div');
  body.className = 'toast-body';
  body.textContent = message;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'btn-close btn-close-white me-2 m-auto';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', function () {
    toast.remove();
  });
  row.append(body, close);
  toast.appendChild(row);
  container.appendChild(toast);
  requestAnimationFrame(function () {
    toast.classList.add('show');
  });
  window.setTimeout(function () {
    toast.remove();
  }, 4500);
}

window.showAppToast = showAppToast;

function buildSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.id = 'appSidebar';

  let toggle = document.getElementById('mobileMenuToggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'mobileMenuToggle';
    toggle.className = 'mobile-menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.setAttribute('aria-controls', 'appSidebar');
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i><span>Menu</span>';
    const main = document.querySelector('.main-content');
    if (main) main.insertBefore(toggle, main.firstChild);
  }

  let backdrop = document.getElementById('sidebarBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('button');
    backdrop.id = 'sidebarBackdrop';
    backdrop.className = 'sidebar-backdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Close navigation menu');
    document.body.appendChild(backdrop);
  }

  function closeSidebar() {
    aside.classList.remove('sidebar-open');
    backdrop.classList.remove('show');
    document.body.classList.remove('sidebar-is-open');
  }
  toggle.onclick = function () {
    aside.classList.toggle('sidebar-open');
    backdrop.classList.toggle('show');
    document.body.classList.toggle(
      'sidebar-is-open',
      aside.classList.contains('sidebar-open'),
    );
  };
  backdrop.onclick = closeSidebar;

  const brand = document.createElement('a');
  brand.href = 'index.html';
  brand.className = 'brand';
  brand.innerHTML =
    '<i class="fa-solid fa-house-user"></i><span>House Bills Splitter</span>';

  const sidebarTop = document.createElement('div');
  sidebarTop.className = 'sidebar-top-row';
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'sidebar-close-button';
  closeButton.setAttribute('aria-label', 'Close navigation menu');
  closeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeButton.addEventListener('click', closeSidebar);
  sidebarTop.append(brand, closeButton);

  const label = document.createElement('p');
  label.className = 'sidebar-label';
  label.textContent = 'MENU';

  const nav = document.createElement('nav');
  nav.className = 'sidebar-nav';
  nav.setAttribute('aria-label', 'Main navigation');

  links.forEach(function (link) {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.className =
      'nav-link' + (link.href === currentPage ? ' active' : '');
    anchor.innerHTML =
      '<i class="fa-solid ' + link.icon + '"></i><span></span>';
    anchor.querySelector('span').textContent = link.label;
    nav.appendChild(anchor);
  });

  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';
  footer.innerHTML =
    '<i class="fa-solid fa-circle-info"></i>' +
    '<span>Manage shared expenses with ease.<br>' +
    '<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates By Exchange Rate API</a></span>';

  aside.append(sidebarTop, label, nav, footer);
  container.replaceChildren(aside);
  aside.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      aside.classList.remove('sidebar-open');
      backdrop.classList.remove('show');
      document.body.classList.remove('sidebar-is-open');
    });
  });
}

buildSidebar();


const __storage = (() => {

  const DATA_KEY = 'houseBillsData';
  const SELECTED_HOUSE_KEY = 'houseBillsSelectedHouse';
  const RATES_KEY = 'houseBillsRates';

  function readItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Could not read from storage:', error);
      return null;
    }
  }

  function writeItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Could not write to storage:', error);
      return false;
    }
  }

  // ----- Main app data -----
  function saveData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid application data.');
    }

    const saved = writeItem(DATA_KEY, JSON.stringify(data));

    if (!saved) {
      if (window.showAppToast)
        window.showAppToast(
          'Could not save your data. Your browser storage may be full or blocked.',
          'error',
        );
    }

    return saved;
  }

  function getData() {
    const savedData = readItem(DATA_KEY);

    if (savedData === null) {
      return null;
    }

    try {
      return JSON.parse(savedData);
    } catch {
      writeItem(DATA_KEY + '_damaged_backup', savedData);
      throw new Error('Saved data is not valid JSON.');
    }
  }

  function clearData() {
    try {
      localStorage.removeItem(DATA_KEY);
    } catch (error) {
      console.error(error);
    }
  }

  function getSelectedHouseId() {
    const saved = readItem(SELECTED_HOUSE_KEY);
    return saved === null ? null : Number(saved);
  }

  function setSelectedHouseId(houseId) {
    if (houseId === null) {
      try {
        localStorage.removeItem(SELECTED_HOUSE_KEY);
      } catch (error) {
        console.error(error);
      }
    } else {
      writeItem(SELECTED_HOUSE_KEY, String(houseId));
    }
  }

  function getRatesCache() {
    const saved = readItem(RATES_KEY);
    if (saved === null) return null;

    try {
      const cache = JSON.parse(saved);
      const looksValid =
        cache &&
        typeof cache.fetchedAt === 'number' &&
        cache.rates &&
        typeof cache.rates === 'object';
      return looksValid ? cache : null;
    } catch {
      return null;
    }
  }

  function saveRatesCache(cache) {
    return writeItem(RATES_KEY, JSON.stringify(cache));
  }

  return {
    saveData,
    getData,
    clearData,
    getSelectedHouseId,
    setSelectedHouseId,
    getRatesCache,
    saveRatesCache,
  };
})();

/* calculations.js */
const __calculations = (() => {

  function toCents(amount) {
    return Math.round(Number(amount) * 100);
  }

  function fromCents(cents) {
    return cents / 100;
  }

  function splitEqually(totalCents, memberIds, rotationIndex = 0) {
    const baseShare = Math.floor(totalCents / memberIds.length);
    const leftover = totalCents - baseShare * memberIds.length;
    const extraMembers = new Set();

    for (let i = 0; i < leftover; i += 1) {
      extraMembers.add((rotationIndex + i) % memberIds.length);
    }

    return memberIds.map(function (memberId, index) {
      return {
        memberId: memberId,
        cents: baseShare + (extraMembers.has(index) ? 1 : 0),
      };
    });
  }

  function calculateSplits(
    splitType,
    amount,
    memberIds,
    inputs = {},
    rotationIndex = 0,
  ) {
    const totalCents = toCents(amount);

    if (!(totalCents > 0)) {
      return { splits: [], error: 'Enter an amount greater than zero.' };
    }

    if (memberIds.length === 0) {
      return { splits: [], error: 'Select at least one member.' };
    }

    let parts = [];

    if (splitType === 'equal') {
      parts = splitEqually(totalCents, memberIds, rotationIndex);
    } else if (splitType === 'exact') {
      parts = memberIds.map(function (memberId) {
        return { memberId: memberId, cents: toCents(inputs[memberId] || 0) };
      });

      const invalid = parts.some(function (part) {
        return !Number.isFinite(part.cents) || part.cents < 0;
      });

      if (invalid) {
        return {
          splits: [],
          error: 'Enter a valid amount for every selected member.',
        };
      }

      const sum = parts.reduce(function (total, part) {
        return total + part.cents;
      }, 0);

      if (sum !== totalCents) {
        return {
          splits: [],
          error:
            'Amounts add up to ₦' +
            fromCents(sum).toFixed(2) +
            ' but the expense is ₦' +
            fromCents(totalCents).toFixed(2) +
            '.',
        };
      }
    } else if (splitType === 'percentage') {
      const percentages = memberIds.map(function (memberId) {
        return Number(inputs[memberId] || 0);
      });

      const invalid = percentages.some(function (p) {
        return !Number.isFinite(p) || p < 0;
      });

      if (invalid) {
        return {
          splits: [],
          error: 'Enter a valid percentage for every selected member.',
        };
      }

      const sumPercent = percentages.reduce(function (total, p) {
        return total + p;
      }, 0);

      if (Math.abs(sumPercent - 100) > 0.000001) {
        return {
          splits: [],
          error:
            'Percentages add up to ' +
            Math.round(sumPercent * 100) / 100 +
            '% but must be 100%.',
        };
      }

      parts = memberIds.map(function (memberId, index) {
        const exactShare = (totalCents * percentages[index]) / 100;
        const wholeKobo = Math.floor(exactShare);
        return {
          memberId: memberId,
          cents: wholeKobo,
          remainder: exactShare - wholeKobo,
          index: index,
        };
      });

      let leftoverKobo =
        totalCents -
        parts.reduce(function (total, part) {
          return total + part.cents;
        }, 0);
      const order = parts.slice().sort(function (a, b) {
        if (b.remainder !== a.remainder) return b.remainder - a.remainder;
        const aTurn =
          (a.index - rotationIndex + memberIds.length) % memberIds.length;
        const bTurn =
          (b.index - rotationIndex + memberIds.length) % memberIds.length;
        return aTurn - bTurn;
      });

      for (let i = 0; i < leftoverKobo; i += 1) {
        order[i % order.length].cents += 1;
      }
    } else {
      return { splits: [], error: 'Unknown split type.' };
    }

    return {
      splits: parts.map(function (part) {
        return { memberId: part.memberId, amount: fromCents(part.cents) };
      }),
      error: '',
    };
  }


  function convertSplits(splits, convertedTotalCents) {
    const weights = splits.map(function (split) {
      return BigInt(toCents(split.amount));
    });
    const weightSum = weights.reduce(function (total, w) {
      return total + w;
    }, 0n);
    const total = BigInt(convertedTotalCents);

    const parts = weights.map(function (weight, index) {
      return {
        index: index,
        cents: (total * weight) / weightSum, // rounded down
        remainder: (total * weight) % weightSum, // what was rounded off
      };
    });

    let leftover = Number(
      total -
        parts.reduce(function (sum, p) {
          return sum + p.cents;
        }, 0n),
    );

    parts
      .slice()
      .sort(function (a, b) {
        return a.remainder > b.remainder
          ? -1
          : a.remainder < b.remainder
            ? 1
            : a.index - b.index;
      })
      .forEach(function (part) {
        if (leftover > 0) {
          part.cents += 1n;
          leftover -= 1;
        }
      });

    return splits.map(function (split, index) {
      return {
        memberId: split.memberId,
        amount: fromCents(Number(parts[index].cents)),
      };
    });
  }

  function buildExpenseNumbers(
    splitType,
    amount,
    memberIds,
    inputs,
    rate,
    rotationIndex = 0,
  ) {
    if (!rate) {
      return {
        nairaAmount: 0,
        splits: [],
        error: 'The exchange rate is not available yet.',
      };
    }

    const result = calculateSplits(
      splitType,
      amount,
      memberIds,
      inputs,
      rotationIndex,
    );

    if (result.error) {
      return { nairaAmount: 0, splits: [], error: result.error };
    }

    if (rate === 1) {
      return {
        nairaAmount: fromCents(toCents(amount)),
        splits: result.splits,
        error: '',
      };
    }

    const nairaCents = Math.round(Number(amount) * rate * 100);

    if (!(nairaCents > 0)) {
      return {
        nairaAmount: 0,
        splits: [],
        error: 'That amount is too small to convert.',
      };
    }

    if (splitType !== 'exact') {
      const nairaResult = calculateSplits(
        splitType,
        fromCents(nairaCents),
        memberIds,
        inputs,
        rotationIndex,
      );
      return {
        nairaAmount: fromCents(nairaCents),
        splits: nairaResult.splits,
        error: nairaResult.error,
      };
    }

    return {
      nairaAmount: fromCents(nairaCents),
      splits: convertSplits(result.splits, nairaCents),
      error: '',
    };
  }

  function calculateBalances(data, houseId) {
    const members = data.members.filter(function (m) {
      return m.houseId === houseId;
    });
    const totals = {};

    members.forEach(function (member) {
      totals[member.id] = { paid: 0, owed: 0, settled: 0 };
    });

    data.expenses
      .filter(function (expense) {
        return expense.houseId === houseId;
      })
      .forEach(function (expense) {
        if (totals[expense.paidBy]) {
          totals[expense.paidBy].paid += toCents(expense.amount);
        }

        expense.splits.forEach(function (split) {
          if (totals[split.memberId]) {
            totals[split.memberId].owed += toCents(split.amount);
          }
        });
      });

    data.settlements
      .filter(function (item) {
        return item.houseId === houseId;
      })
      .forEach(function (item) {
        if (totals[item.fromMemberId])
          totals[item.fromMemberId].settled += toCents(item.amount);
        if (totals[item.toMemberId])
          totals[item.toMemberId].settled -= toCents(item.amount);
      });

    return members.map(function (member) {
      const t = totals[member.id];
      return {
        member: member,
        paid: fromCents(t.paid),
        owed: fromCents(t.owed),
        settled: fromCents(t.settled),
        net: fromCents(t.paid - t.owed + t.settled),
      };
    });
  }

  function sumOfBalances(balances) {
    const totalCents = balances.reduce(function (sum, b) {
      return sum + toCents(b.net);
    }, 0);
    return fromCents(totalCents);
  }


  const MAX_PEOPLE_FOR_EXACT_SEARCH = 16; 

  function suggestRepayments(balances) {
    const people = balances
      .map(function (b) {
        return { id: b.member.id, cents: toCents(b.net) };
      })
      .filter(function (p) {
        return p.cents !== 0;
      });

    if (people.length === 0) return [];

    const groups =
      people.length <= MAX_PEOPLE_FOR_EXACT_SEARCH
        ? findZeroSumGroups(people)
        : [people]; 

    let repayments = [];
    groups.forEach(function (group) {
      repayments = repayments.concat(settleGroup(group));
    });
    return repayments;
  }

  function findZeroSumGroups(people) {
    const count = people.length;
    const total = 1 << count;
    const sums = new Array(total).fill(0);
    const best = new Array(total).fill(0);
    const lastAdded = new Array(total).fill(-1);

    for (let mask = 1; mask < total; mask++) {
      const lowestBit = mask & -mask;
      sums[mask] =
        sums[mask ^ lowestBit] + people[31 - Math.clz32(lowestBit)].cents;

      for (let i = 0; i < count; i++) {
        if (mask & (1 << i)) {
          const score = best[mask ^ (1 << i)];
          if (lastAdded[mask] === -1 || score > best[mask]) {
            best[mask] = score;
            lastAdded[mask] = i;
          }
        }
      }

      if (sums[mask] === 0) best[mask] += 1; 
    }

    const order = [];
    for (let mask = total - 1; mask > 0; mask ^= 1 << lastAdded[mask]) {
      order.push(lastAdded[mask]);
    }
    order.reverse();

    const groups = [];
    let current = [];
    let running = 0;

    order.forEach(function (index) {
      current.push(people[index]);
      running += people[index].cents;
      if (running === 0) {
        groups.push(current);
        current = [];
      }
    });

    if (current.length > 0) groups.push(current); 
    return groups;
  }

  function settleGroup(group) {
    const debtors = group
      .filter(function (p) {
        return p.cents < 0;
      })
      .map(function (p) {
        return { id: p.id, cents: -p.cents };
      })
      .sort(function (a, b) {
        return b.cents - a.cents;
      });

    const creditors = group
      .filter(function (p) {
        return p.cents > 0;
      })
      .map(function (p) {
        return { id: p.id, cents: p.cents };
      })
      .sort(function (a, b) {
        return b.cents - a.cents;
      });

    const payments = [];
    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
      const amount = Math.min(debtors[d].cents, creditors[c].cents);

      payments.push({
        fromMemberId: debtors[d].id,
        toMemberId: creditors[c].id,
        amount: fromCents(amount),
      });

      debtors[d].cents -= amount;
      creditors[c].cents -= amount;

      if (debtors[d].cents === 0) d++;
      if (creditors[c].cents === 0) c++;
    }

    return payments;
  }

  function getMonthSummary(data, houseId, month) {
    const expenses = data.expenses.filter(function (e) {
      return e.houseId === houseId && e.date.slice(0, 7) === month;
    });

    let totalCents = 0;
    let biggest = null;
    const categoryCents = {};
    const memberTotals = {};

    data.members
      .filter(function (m) {
        return m.houseId === houseId;
      })
      .forEach(function (m) {
        memberTotals[m.id] = { name: m.name, paidCents: 0, shareCents: 0 };
      });

    expenses.forEach(function (expense) {
      const cents = toCents(expense.amount);
      totalCents += cents;
      categoryCents[expense.category] =
        (categoryCents[expense.category] || 0) + cents;

      if (biggest === null || cents > toCents(biggest.amount))
        biggest = expense;

      if (memberTotals[expense.paidBy])
        memberTotals[expense.paidBy].paidCents += cents;

      expense.splits.forEach(function (split) {
        if (memberTotals[split.memberId])
          memberTotals[split.memberId].shareCents += toCents(split.amount);
      });
    });

    const categories = {};
    Object.keys(categoryCents).forEach(function (name) {
      categories[name] = fromCents(categoryCents[name]);
    });

    return {
      total: fromCents(totalCents),
      count: expenses.length,
      biggest: biggest,
      categories: categories,
      members: Object.keys(memberTotals).map(function (id) {
        const t = memberTotals[id];
        return {
          memberId: Number(id),
          name: t.name,
          paid: fromCents(t.paidCents),
          share: fromCents(t.shareCents),
        };
      }),
    };
  }

  function findDueRecurring(expenses, houseId, month) {
    const newestBySeries = {};

    expenses
      .filter(function (e) {
        return e.houseId === houseId && e.recurringId;
      })
      .forEach(function (e) {
        const current = newestBySeries[e.recurringId];
        const isNewer =
          !current ||
          e.date > current.date ||
          (e.date === current.date && e.createdAt > current.createdAt);
        if (isNewer) newestBySeries[e.recurringId] = e;
      });

    return Object.values(newestBySeries).filter(function (newest) {
      return newest.recurring === true && newest.date.slice(0, 7) < month;
    });
  }

  return {
    toCents,
    fromCents,
    calculateSplits,
    convertSplits,
    buildExpenseNumbers,
    calculateBalances,
    sumOfBalances,
    suggestRepayments,
    getMonthSummary,
    findDueRecurring,
  };
})();

/* helpers.js */
const __helpers = (() => {
  const { getSelectedHouseId, setSelectedHouseId } = __storage;

  function formatCurrency(amount, currency = 'NGN') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  function makeId() {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
  }

  function todayString() {
    return new Date().toLocaleDateString('en-CA');
  }

  function currentMonth() {
    return todayString().slice(0, 7);
  }

  function formatMonth(monthString) {
    return new Date(monthString + '-01T00:00:00').toLocaleDateString('en-NG', {
      month: 'long',
      year: 'numeric',
    });
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-NG', {
      dateStyle: 'medium',
    });
  }

  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function showEmpty(container, message) {
    container.replaceChildren(el('p', 'empty-state', message));
  }

  function getMemberName(data, memberId) {
    const member = data.members.find(function (item) {
      return item.id === memberId;
    });
    return member ? member.name : 'Unknown member';
  }

  function setupHouseSelect(select, houses, onChange) {
    select.replaceChildren();

    if (houses.length === 0) {
      const option = el('option', '', 'No houses yet');
      option.value = '';
      select.appendChild(option);
      select.disabled = true;
      return null;
    }

    houses.forEach((house) => {
      const option = el('option', '', house.name);
      option.value = house.id;
      select.appendChild(option);
    });

    const savedId = getSelectedHouseId();
    const stillExists = houses.some(function (house) {
      return house.id === savedId;
    });
    const activeId = stillExists ? savedId : houses[0].id;

    select.value = activeId;
    setSelectedHouseId(activeId);

    select.addEventListener('change', function () {
      const newId = Number(select.value);
      setSelectedHouseId(newId);
      onChange(newId);
    });

    return activeId;
  }

  return {
    formatCurrency,
    makeId,
    todayString,
    currentMonth,
    formatMonth,
    formatDate,
    el,
    showEmpty,
    getMemberName,
    setupHouseSelect,
  };
})();

/* data.js */
const __data = (() => {
  const { getData, saveData } = __storage;
  
  const COLLECTIONS = ['houses', 'members', 'expenses', 'settlements'];

  function createEmptyData() {
    return { houses: [], members: [], expenses: [], settlements: [] };
  }

  function isValidData(data) {
    return (
      data !== null &&
      typeof data === 'object' &&
      COLLECTIONS.every(function (name) {
        return Array.isArray(data[name]);
      })
    );
  }

  async function initializeData() {
    let existingData = null;

    try {
      existingData = getData();
    } catch (error) {
      console.warn('Saved data was damaged, starting again.', error);
    }

    if (isValidData(existingData)) {
      return existingData;
    }

    let initialData = createEmptyData();

    try {
      const response = await fetch('./data.json');

      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }

      const demoData = await response.json();

      if (isValidData(demoData)) {
        initialData = demoData;
      }
    } catch (error) {
      console.warn(
        'Could not load data.json, starting with empty data.',
        error,
      );
    }

    saveData(initialData);
    return initialData;
  }

  return { initializeData };
})();

/* rates.js */
const __rates = (() => {
  const { getRatesCache, saveRatesCache } = __storage;

  const CACHE_MAX_AGE_HOURS = 12; 
  const API_URL = 'https://open.er-api.com/v6/latest/NGN';
  const TIMEOUT_MS = 8000;

  const HOUSE_CURRENCY = 'NGN';

  const CURRENCIES = [
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GHS', name: 'Ghanaian Cedi' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'CAD', name: 'Canadian Dollar' },
  ];

  function ageInHours(timestamp) {
    return (Date.now() - timestamp) / (1000 * 60 * 60);
  }

  async function fetchFreshRates() {
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch(API_URL, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(
          'The exchange-rate service returned an error (' +
            response.status +
            ').',
        );
      }

      const data = await response.json();

      if (data.result !== 'success' || !data.rates) {
        throw new Error('The exchange-rate service sent an unexpected reply.');
      }

      return data.rates;
    } finally {
      clearTimeout(timer);
    }
  }

  async function getRates() {
    const cached = getRatesCache();

    if (cached && ageInHours(cached.fetchedAt) < CACHE_MAX_AGE_HOURS) {
      return {
        rates: cached.rates,
        fetchedAt: cached.fetchedAt,
        status: 'cache',
        message: '',
      };
    }

    try {
      if (navigator.onLine === false) {
        throw new Error('You are offline.');
      }

      const rates = await fetchFreshRates();
      const fresh = { rates: rates, fetchedAt: Date.now() };
      saveRatesCache(fresh);
      return {
        rates: rates,
        fetchedAt: fresh.fetchedAt,
        status: 'live',
        message: '',
      };
    } catch (error) {
      const reason =
        navigator.onLine === false
          ? 'You are offline.'
          : 'Could not reach the exchange-rate service.';

      if (cached) {
        return {
          rates: cached.rates,
          fetchedAt: cached.fetchedAt,
          status: 'stale',
          message: reason,
        };
      }

      throw new Error(reason + ' No saved rates are available yet.');
    }
  }

  
  function nairaPerUnit(rates, currencyCode) {
    if (currencyCode === HOUSE_CURRENCY) return 1;

    const rate = rates[currencyCode];
    if (!rate || !Number.isFinite(rate) || rate <= 0) return null;

    return 1 / rate;
  }

  function describeAge(timestamp) {
    const hours = ageInHours(timestamp);
    if (hours < 1) return 'less than an hour ago';
    if (hours < 24)
      return (
        Math.floor(hours) +
        (Math.floor(hours) === 1 ? ' hour ago' : ' hours ago')
      );
    const days = Math.floor(hours / 24);
    return days + (days === 1 ? ' day ago' : ' days ago');
  }

  return {
    CACHE_MAX_AGE_HOURS,
    HOUSE_CURRENCY,
    CURRENCIES,
    getRates,
    nairaPerUnit,
    describeAge,
  };
})();

/* recurring.js */
const __recurring = (() => {
  const { getData, saveData } = __storage;
  const { buildExpenseNumbers, findDueRecurring } = __calculations;
  const { getRates, nairaPerUnit, HOUSE_CURRENCY } = __rates;
  const { makeId, todayString, currentMonth, formatMonth, formatCurrency, el } =
    __helpers;
 
  async function addThisMonthsCopy(oldExpense) {
    const data = getData();
    const currency = oldExpense.currency || HOUSE_CURRENCY;

    let rate = oldExpense.exchangeRate || 1;
    let rateFetchedAt = oldExpense.rateFetchedAt || null;

    if (currency !== HOUSE_CURRENCY) {
      try {
        const result = await getRates();
        rate = nairaPerUnit(result.rates, currency) || rate;
        rateFetchedAt = result.fetchedAt;
      } catch (error) {
        console.warn('Using the previous exchange rate:', error.message);
      }
    }

    const originalAmount = oldExpense.originalAmount || oldExpense.amount;
    const numbers = buildExpenseNumbers(
      oldExpense.splitType,
      originalAmount,
      oldExpense.participantIds,
      oldExpense.splitInputs || {},
      rate,
    );

    if (numbers.error) {
      throw new Error(numbers.error);
    }

    data.expenses.push({
      id: makeId(),
      houseId: oldExpense.houseId,
      title: oldExpense.title,
      category: oldExpense.category,
      amount: numbers.nairaAmount,
      currency: currency,
      originalAmount: originalAmount,
      exchangeRate: rate,
      rateFetchedAt: rateFetchedAt,
      paidBy: oldExpense.paidBy,
      participantIds: oldExpense.participantIds,
      splitType: oldExpense.splitType,
      splitInputs: oldExpense.splitInputs || {},
      splits: numbers.splits,
      date: todayString(),
      recurring: true,
      recurringId: oldExpense.recurringId,
      createdAt: new Date().toISOString(),
    });

    return saveData(data);
  }

  function renderRecurringReminder(container, houseId, onChange) {
    container.replaceChildren();
    if (houseId === null) return;

    const due = findDueRecurring(getData().expenses, houseId, currentMonth());
    if (due.length === 0) return;

    const box = el('div', 'alert alert-warning');
    box.setAttribute('role', 'alert');
    box.appendChild(
      el(
        'strong',
        '',
        'Recurring bills due for ' + formatMonth(currentMonth()),
      ),
    );
    const message = el('p', 'mb-2 small', '');
    box.appendChild(message);

    async function addOne(expense, button) {
      button.disabled = true; 
      button.textContent = 'Adding...';

      try {
        await addThisMonthsCopy(expense);
        onChange();
      } catch (error) {
        console.error(error);
        message.textContent =
          'Could not add "' + expense.title + '": ' + error.message;
        button.disabled = false;
        button.textContent = 'Add now';
      }
    }

    due.forEach(function (expense) {
      const row = el(
        'div',
        'd-flex align-items-center justify-content-between gap-2 py-1',
      );
      row.appendChild(
        el('span', '', expense.title + ' · ' + formatCurrency(expense.amount)),
      );

      const button = el('button', 'btn btn-sm btn-dark', 'Add now');
      button.type = 'button';
      button.addEventListener('click', function () {
        addOne(expense, button);
      });
      row.appendChild(button);
      box.appendChild(row);
    });

    container.appendChild(box);
  }

  return { renderRecurringReminder };
})();

/* dashboard.js */
const __dashboard = (() => {
  const { initializeData } = __data;
  const { getData } = __storage;
  const { calculateBalances, getMonthSummary, toCents, fromCents } =
    __calculations;
  const { renderRecurringReminder } = __recurring;
  const { setupHouseSelect, formatCurrency, currentMonth, formatMonth } =
    __helpers;
  if (document.getElementById('greeting')) {

    const greeting = document.getElementById('greeting');
    const houseSelect = document.getElementById('houseSelect');
    const totalSpendingCard = document.getElementById('totalSpending');
    const monthLabel = document.getElementById('monthLabel');
    const biggestAmount = document.getElementById('biggestAmount');
    const biggestTitle = document.getElementById('biggestTitle');
    const outstandingCard = document.getElementById('outstanding');
    const expenseCountCard = document.getElementById('expenseCount');
    const reminderBox = document.getElementById('recurringReminder');
    const recentExpenses = document.getElementById('recentExpenses');

    const CHART_COLORS = {
      Rent: '#071B3E',
      Other: '#4F8BFF',
      Electricity: '#087A36',
      Food: '#A9C9F5',
      Fuel: '#6EF28A',
      Internet: '#777982',
    };

    const charts = { category: null, member: null };
    let currentHouseId = null;

    function getGreeting() {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning!';
      if (hour < 17) return 'Good afternoon!';
      return 'Good evening!';
    }

    function drawChart(
      name,
      canvasId,
      emptyId,
      hasData,
      emptyMessage,
      makeConfig,
    ) {
      const canvas = document.getElementById(canvasId);
      const emptyBox = document.getElementById(emptyId);

      if (charts[name]) {
        charts[name].destroy();
        charts[name] = null;
      }

      const chartAvailable = typeof Chart !== 'undefined';
      canvas.hidden = !(hasData && chartAvailable);
      emptyBox.hidden = hasData && chartAvailable;
      emptyBox.textContent = chartAvailable
        ? emptyMessage
        : 'Charts could not load. Check your internet connection.';

      if (hasData && chartAvailable) {
        charts[name] = new Chart(canvas, makeConfig());
      }
    }

    function render(houseId) {
      currentHouseId = houseId;
      const appData = getData(); 
      renderRecurringReminder(reminderBox, houseId, function () {
        render(currentHouseId);
      });

      const month = currentMonth();
      monthLabel.textContent = formatMonth(month);

      if (houseId === null) {
        if (recentExpenses)
          recentExpenses.textContent =
            'Create a house and add an expense to see recent activity.';
        totalSpendingCard.textContent = formatCurrency(0);
        outstandingCard.textContent = formatCurrency(0);
        biggestAmount.textContent = formatCurrency(0);
        biggestTitle.textContent = 'Create a house first';
        expenseCountCard.textContent = '0';
        drawChart(
          'category',
          'categoryChart',
          'categoryEmpty',
          false,
          'Create a house on the Houses & Members page to get started.',
        );
        drawChart(
          'member',
          'memberChart',
          'memberEmpty',
          false,
          'Create a house on the Houses & Members page to get started.',
        );
        return;
      }

      const summary = getMonthSummary(appData, houseId, month);

      if (recentExpenses) {
        const recent = appData.expenses
          .filter(function (expense) {
            return expense.houseId === houseId;
          })
          .sort(function (a, b) {
            return (
              b.date.localeCompare(a.date) ||
              String(b.createdAt || b.id).localeCompare(
                String(a.createdAt || a.id),
              )
            );
          })
          .slice(0, 5);
        recentExpenses.replaceChildren();
        if (recent.length === 0) {
          recentExpenses.textContent =
            'No expenses recorded for this house yet.';
        } else {
          recent.forEach(function (expense) {
            const row = document.createElement('div');
            row.className = 'data-row';
            const info = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = expense.title;
            const detail = document.createElement('small');
            detail.className = 'd-block text-secondary';
            detail.textContent = expense.category + ' · ' + expense.date;
            info.append(title, detail);
            const amount = document.createElement('strong');
            amount.textContent = formatCurrency(expense.amount);
            row.append(info, amount);
            recentExpenses.appendChild(row);
          });
        }
      }

      totalSpendingCard.textContent = formatCurrency(summary.total);
      expenseCountCard.textContent = summary.count;

      if (summary.biggest) {
        biggestAmount.textContent = formatCurrency(summary.biggest.amount);
        biggestTitle.textContent = summary.biggest.title;
      } else {
        biggestAmount.textContent = formatCurrency(0);
        biggestTitle.textContent = 'Nothing yet this month';
      }

      const stillOwedCents = calculateBalances(appData, houseId).reduce(
        function (sum, b) {
          return b.net > 0 ? sum + toCents(b.net) : sum;
        },
        0,
      );
      outstandingCard.textContent = formatCurrency(fromCents(stillOwedCents));

      const emptyMessage =
        'No expenses yet this month. Add the first bill for this house.';
      const categories = Object.keys(summary.categories);

      drawChart(
        'category',
        'categoryChart',
        'categoryEmpty',
        categories.length > 0,
        emptyMessage,
        function () {
          return {
            type: 'pie',
            data: {
              labels: categories,
              datasets: [
                {
                  data: categories.map(function (c) {
                    return summary.categories[c];
                  }),
                  backgroundColor: categories.map(function (c) {
                    return CHART_COLORS[c] || '#4F8BFF';
                  }),
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: function (ctx) {
                      return ctx.label + ': ' + formatCurrency(ctx.raw);
                    },
                  },
                },
              },
            },
          };
        },
      );

      const members = summary.members.filter(function (m) {
        return m.paid > 0 || m.share > 0;
      });

      drawChart(
        'member',
        'memberChart',
        'memberEmpty',
        members.length > 0,
        emptyMessage,
        function () {
          return {
            type: 'bar',
            data: {
              labels: members.map(function (m) {
                return m.name;
              }),
              datasets: [
                {
                  label: 'Paid',
                  data: members.map(function (m) {
                    return m.paid;
                  }),
                  backgroundColor: '#071B3E',
                },
                {
                  label: 'Share',
                  data: members.map(function (m) {
                    return m.share;
                  }),
                  backgroundColor: '#6EF28A',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (v) {
                      return formatCurrency(v);
                    },
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (ctx) {
                      return ctx.dataset.label + ': ' + formatCurrency(ctx.raw);
                    },
                  },
                },
              },
            },
          };
        },
      );
    }

    async function startPage() {
      greeting.textContent = getGreeting();

      try {
        const data = await initializeData();
        render(setupHouseSelect(houseSelect, data.houses, render));
      } catch (error) {
        console.error('Dashboard loading failed:', error);
        totalSpendingCard.textContent = 'Unable to load';
      }
    }

    startPage();
  }
  return {};
})();

/* house-page.js */
const __house_page = (() => {
  const { getData, saveData, getSelectedHouseId, setSelectedHouseId } =
    __storage;
  const { initializeData } = __data;
  const { makeId, el, formatCurrency } = __helpers;
  const { calculateBalances } = __calculations;
  if (document.getElementById('createHouseForm')) {

    const createHouseForm = document.getElementById('createHouseForm');
    const houseName = document.getElementById('houseName');
    const houseAddress = document.getElementById('houseAddress');
    const formMessage = document.getElementById('formMessage');
    const deleteHouseButton = document.getElementById('deleteHouseButton');
    const housesList = document.getElementById('housesList');
    const houseCount = document.getElementById('houseCount');

    const addMemberForm = document.getElementById('addMemberForm');
    const memberHouse = document.getElementById('memberHouse');
    const memberName = document.getElementById('memberName');
    const memberMessage = document.getElementById('memberMessage');
    const membersList = document.getElementById('membersList');

    let selectedHouseId = null;

    function showMessage(element, message, success = true) {
      element.textContent = message;
      element.className = success
        ? 'form-message text-success'
        : 'form-message text-danger';
    }

    function chooseHouse(houseId) {
      selectedHouseId = houseId;
      setSelectedHouseId(houseId);
    }

    function displayHouseOptions() {
      const data = getData();
      memberHouse.innerHTML = '<option value="">Choose a house</option>';

      data.houses.forEach(function (house) {
        const option = el('option', '', house.name);
        option.value = house.id;
        memberHouse.appendChild(option);
      });

      if (selectedHouseId !== null) memberHouse.value = selectedHouseId;
    }

    function displayHouses() {
      const data = getData();
      housesList.replaceChildren();
      houseCount.textContent =
        data.houses.length + (data.houses.length === 1 ? ' house' : ' houses');

      if (data.houses.length === 0) {
        housesList.appendChild(
          el(
            'p',
            'empty-state',
            'No houses yet. Create your first house above.',
          ),
        );
        deleteHouseButton.disabled = true;
        return;
      }

      data.houses.forEach(function (house) {
        const isSelected = house.id === selectedHouseId;

        const column = el('div', 'col-12 col-md-6');
        const card = el(
          'div',
          'house-card' + (isSelected ? ' selected-house' : ''),
        );

        const members = data.members.filter(function (member) {
          return member.houseId === house.id && !member.archived;
        });
        const count = el(
          'small',
          '',
          members.length + (members.length === 1 ? ' member' : ' members'),
        );

        const button = el(
          'button',
          isSelected
            ? 'btn btn-primary btn-sm mt-3'
            : 'btn btn-outline-primary btn-sm mt-3',
          isSelected ? 'Selected' : 'View members',
        );
        button.type = 'button';
        button.addEventListener('click', function () {
          chooseHouse(house.id);
          memberHouse.value = house.id;
          refreshPage();
        });

        card.append(
          el('h3', '', house.name),
          el('p', '', house.address),
          count,
          el('br'),
          button,
        );
        column.appendChild(card);
        housesList.appendChild(column);
      });

      deleteHouseButton.disabled = selectedHouseId === null;
    }

    function displayMembers() {
      membersList.replaceChildren();

      if (selectedHouseId === null) {
        membersList.appendChild(
          el('p', 'empty-state', 'Select a house above to see its members.'),
        );
        return;
      }

      const data = getData();
      const houseMembers = data.members.filter(function (member) {
        return member.houseId === selectedHouseId && !member.archived;
      });

      if (houseMembers.length === 0) {
        membersList.appendChild(
          el('p', 'empty-state', 'No members in this house yet.'),
        );
        return;
      }

      houseMembers.forEach(function (member) {
        const row = el('div', 'member-row');
        const buttons = el('div', 'd-flex gap-2');

        const editButton = el(
          'button',
          'btn btn-outline-primary btn-sm',
          'Edit',
        );
        editButton.type = 'button';
        editButton.addEventListener('click', function () {
          editMember(member.id);
        });

        const deleteButton = el(
          'button',
          'btn btn-outline-danger btn-sm',
          'Delete',
        );
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', function () {
          deleteMember(member.id);
        });

        buttons.append(editButton, deleteButton);
        row.append(el('span', '', member.name), buttons);
        membersList.appendChild(row);
      });
    }

    function refreshPage() {
      displayHouseOptions();
      displayHouses();
      displayMembers();
    }

    createHouseForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = houseName.value.trim();
      const address = houseAddress.value.trim();

      if (!name || !address) {
        showMessage(formMessage, 'Enter the house name and address.', false);
        return;
      }

      const data = getData();
      const alreadyExists = data.houses.some(function (house) {
        return house.name.toLowerCase() === name.toLowerCase();
      });

      if (alreadyExists) {
        showMessage(
          formMessage,
          'A house with this name already exists.',
          false,
        );
        return;
      }

      const newHouse = {
        id: makeId(),
        name: name,
        address: address,
        createdAt: new Date().toISOString(),
      };

      data.houses.push(newHouse);
      saveData(data);

      chooseHouse(newHouse.id);
      createHouseForm.reset();
      showMessage(formMessage, 'House created.');
      refreshPage();
    });

    addMemberForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const houseId = Number(memberHouse.value);
      const name = memberName.value.trim();

      if (!memberHouse.value || !name) {
        showMessage(
          memberMessage,
          'Choose a house and enter a member name.',
          false,
        );
        return;
      }

      const data = getData();
      const existing = data.members.find(function (member) {
        return (
          member.houseId === houseId &&
          member.name.toLowerCase() === name.toLowerCase()
        );
      });

      if (existing && !existing.archived) {
        showMessage(
          memberMessage,
          'This member is already in that house.',
          false,
        );
        return;
      }

      if (existing) {
        existing.archived = false;
        saveData(data);
        chooseHouse(houseId);
        addMemberForm.reset();
        showMessage(memberMessage, existing.name + ' was added back.');
        refreshPage();
        return;
      }

      const newMember = {
        id: makeId(),
        houseId: houseId,
        name: name,
        createdAt: new Date().toISOString(),
      };
      data.members.push(newMember);
      saveData(data);

      chooseHouse(houseId);
      addMemberForm.reset();
      showMessage(memberMessage, 'Member added.');
      refreshPage();
    });

    memberHouse.addEventListener('change', function () {
      chooseHouse(memberHouse.value ? Number(memberHouse.value) : null);
      displayHouses();
      displayMembers();
    });

    function editMember(memberId) {
      const data = getData();
      const member = data.members.find(function (item) {
        return item.id === memberId;
      });
      if (!member) return;

      const newName = prompt('Enter the new member name:', member.name);
      if (newName === null) return;

      if (!newName.trim()) {
        if (window.showAppToast)
          window.showAppToast('The name cannot be empty.', 'error');
        return;
      }

      const oldName = member.name;
      member.name = newName.trim();
      saveData(data);
      showMessage(memberMessage, 'Member updated.');
      refreshPage();
    }

    function deleteMember(memberId) {
      const data = getData();
      const member = data.members.find(function (item) {
        return item.id === memberId;
      });
      if (!member) return;

      const balance = calculateBalances(data, member.houseId).find(
        function (b) {
          return b.member.id === memberId;
        },
      );

      if (balance && Math.abs(balance.net) >= 0.005) {
        const text =
          balance.net < 0
            ? member.name + ' still owes ' + formatCurrency(-balance.net) + '.'
            : member.name +
              ' is still owed ' +
              formatCurrency(balance.net) +
              '.';
        if (window.showAppToast)
          window.showAppToast(
            text +
              ' Please settle up on the Settlements page first, then remove them.',
            'error',
          );
        return;
      }

      const hasHistory =
        data.expenses.some(function (expense) {
          return (
            expense.paidBy === memberId ||
            expense.participantIds.includes(memberId)
          );
        }) ||
        data.settlements.some(function (item) {
          return item.fromMemberId === memberId || item.toMemberId === memberId;
        });

      if (hasHistory) {
        if (
          !confirm(
            'Remove ' +
              member.name +
              '? They are settled up, so their past expenses stay in the history.',
          )
        )
          return;
        member.archived = true;
      } else {
        if (!confirm('Delete ' + member.name + '?')) return;
        data.members = data.members.filter(function (item) {
          return item.id !== memberId;
        });
      }

      saveData(data);
      showMessage(memberMessage, member.name + ' was removed.');
      refreshPage();
    }

    deleteHouseButton.addEventListener('click', function () {
      if (selectedHouseId === null) return;

      const data = getData();
      const house = data.houses.find(function (item) {
        return item.id === selectedHouseId;
      });
      const expenseCount = data.expenses.filter(function (e) {
        return e.houseId === selectedHouseId;
      }).length;
      const paymentCount = data.settlements.filter(function (item) {
        return item.houseId === selectedHouseId;
      }).length;

      if (expenseCount < 0 || paymentCount < 0) {
        if (window.showAppToast)
          window.showAppToast(
            'This house has expense or payment history. The house cannot be deleted so its financial history stays safe.',
            'error',
          );
        return;
      }

      const warning =
        'Delete "' + house.name + '" and its members? This cannot be undone.';
      if (!confirm(warning)) return;

      const houseId = selectedHouseId;
      data.houses = data.houses.filter(function (item) {
        return item.id !== houseId;
      });
      data.members = data.members.filter(function (item) {
        return item.houseId !== houseId;
      });
      data.expenses = data.expenses.filter(function (item) {
        return item.houseId !== houseId;
      });
      data.settlements = data.settlements.filter(function (item) {
        return item.houseId !== houseId;
      });
      saveData(data);

      chooseHouse(null);
      showMessage(formMessage, 'House deleted.');
      refreshPage();
    });

    async function startPage() {
      try {
        const data = await initializeData();
        const savedId = getSelectedHouseId();
        const exists = data.houses.some(function (house) {
          return house.id === savedId;
        });
        selectedHouseId = exists ? savedId : null;
        refreshPage();
      } catch (error) {
        console.error(error);
        housesList.textContent =
          'Could not load houses. Refresh the page and try again.';
      }
    }

    startPage();
  }
  return {};
})();

/* expenses.js */
const __expenses = (() => {
  const { getData, saveData, getSelectedHouseId, setSelectedHouseId } =
    __storage;
  const { initializeData } = __data;
  const { buildExpenseNumbers, calculateBalances } = __calculations;
  const { getRates, nairaPerUnit, describeAge, CURRENCIES, HOUSE_CURRENCY } =
    __rates;
  const { renderRecurringReminder } = __recurring;
  const {
    makeId,
    todayString,
    formatDate,
    formatCurrency,
    getMemberName,
    el,
    showEmpty,
  } = __helpers;
  if (document.getElementById('expenseForm')) {

    // ----- Page elements -----
    const form = document.getElementById('expenseForm');
    const pageTitle = document.getElementById('pageTitle');
    const houseSelect = document.getElementById('expenseHouse');
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const currencySelect = document.getElementById('expenseCurrency');
    const currencyPrefix = document.getElementById('currencyPrefix');
    const rateBox = document.getElementById('rateBox');
    const rateStatus = document.getElementById('rateStatus');
    const categorySelect = document.getElementById('expenseCategory');
    const dateInput = document.getElementById('expenseDate');
    const payerSelect = document.getElementById('expensePayer');
    const recurringCheck = document.getElementById('expenseRecurring');
    const splitTabs = document.querySelectorAll('.split-tab');
    const splitTypeInput = document.getElementById('splitType');
    const memberList = document.getElementById('memberList');
    const selectedCount = document.getElementById('selectedMembersCount');
    const selectNoneButton = document.getElementById('selectNoneBtn');
    const splitHelp = document.getElementById('splitHelp');
    const statusBadge = document.getElementById('reconciliationStatus');
    const formMessage = document.getElementById('formMessage');
    const expenseList = document.getElementById('expenseList');
    const reminderBox = document.getElementById('recurringReminder');
    const saveButtonText = document.getElementById('saveButtonText');
    const cancelEditButton = document.getElementById('cancelEditButton');

    const previewHouseLabel = document.getElementById('previewHouseLabel');
    const previewHouseName = document.getElementById('previewHouseName');
    const previewMemberCount = document.getElementById('previewMemberCount');
    const previewTotal = document.getElementById('previewTotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryMembers = document.getElementById('summaryMembers');
    const summaryShare = document.getElementById('summaryShare');

    // ----- State -----
    let memberRows = []; 
    let editingExpense = null; 
    let rateInfo = null; 
    let rateRequestNumber = 0; 

    function showMessage(message, success = true) {
      formMessage.textContent = message;
      formMessage.className = success
        ? 'form-message text-success'
        : 'form-message text-danger';
    }

    function getEqualSplitRotation(houseId) {
      const data = getData();
      return data.expenses.filter(function (expense) {
        return (
          expense.houseId === houseId &&
          (!editingExpense || expense.id !== editingExpense.id)
        );
      }).length;
    }

    // Exchange rate
  
    function setRateStatus(message, kind = '') {
      rateStatus.textContent = message;
      rateStatus.className = 'rate-status' + (kind ? ' is-' + kind : '');
    }

  
    function getCurrentRate() {
      const code = currencySelect.value;
      if (code === HOUSE_CURRENCY) return 1;

      if (editingExpense && editingExpense.currency === code)
        return editingExpense.exchangeRate;

      return rateInfo && rateInfo.code === code ? rateInfo.nairaPerUnit : null;
    }

    async function loadRate() {
      const code = currencySelect.value;
      currencyPrefix.textContent = code === HOUSE_CURRENCY ? '₦' : code;
      rateInfo = null;

      if (code === HOUSE_CURRENCY) {
        rateBox.hidden = true;
        updateSplit();
        return;
      }

      rateBox.hidden = false;

      if (editingExpense && editingExpense.currency === code) {
        setRateStatus(
          'Keeping the original rate: 1 ' +
            code +
            ' = ' +
            formatCurrency(editingExpense.exchangeRate),
        );
        updateSplit();
        return;
      }

      const thisRequest = ++rateRequestNumber;
      setRateStatus('Loading exchange rate...'); 
      updateSplit();

      try {
        const result = await getRates();
        if (thisRequest !== rateRequestNumber) return; 

        const rate = nairaPerUnit(result.rates, code);
        if (!rate)
          throw new Error('No exchange rate is available for ' + code + '.');

        rateInfo = {
          code: code,
          nairaPerUnit: rate,
          fetchedAt: result.fetchedAt,
        };
        const rateText = '1 ' + code + ' = ' + formatCurrency(rate);

        if (result.status === 'stale') {
        
          setRateStatus(
            result.message +
              ' Using rates saved ' +
              describeAge(result.fetchedAt) +
              '. ' +
              rateText,
            'warning',
          );
        } else {
          setRateStatus(
            rateText + ' · updated ' + describeAge(result.fetchedAt),
          );
        }
      } catch (error) {
        if (thisRequest !== rateRequestNumber) return;
        setRateStatus(
          error.message + ' Choose NGN, or try again when you are online.',
          'error',
        ); 
      }

      updateSplit();
    }

    // Reading the form
    function getSelectedIds() {
      return memberRows
        .filter(function (row) {
          return row.checkbox.checked;
        })
        .map(function (row) {
          return row.member.id;
        });
    }

    function getTypedValues() {
      const values = {};
      memberRows.forEach(function (row) {
        values[row.member.id] = row.input.value;
      });
      return values;
    }

    // Member rows
    function buildMemberRows(houseId) {
      const data = getData();

      const members = data.members.filter(function (member) {
        if (member.houseId !== houseId) return false;
        const inEditedExpense =
          editingExpense &&
          (editingExpense.paidBy === member.id ||
            editingExpense.participantIds.includes(member.id));
        return !member.archived || inEditedExpense;
      });

      memberList.replaceChildren();
      memberRows = [];

      payerSelect.replaceChildren();
      payerSelect.disabled = members.length === 0;
      payerSelect.appendChild(
        new Option(
          members.length ? 'Select who paid' : 'No members in this house',
          '',
        ),
      );

      if (members.length === 0) {
        showEmpty(
          memberList,
          'This house has no members yet. Add some on the Houses & Members page.',
        );
        updateSplit();
        return;
      }

      members.forEach(function (member) {
        payerSelect.appendChild(new Option(member.name, member.id));

        const row = el('label', 'member-row');
        const checkbox = el('input', 'member-checkbox');
        checkbox.type = 'checkbox';
        checkbox.value = member.id;
        checkbox.checked = editingExpense
          ? editingExpense.participantIds.includes(member.id)
          : !member.archived;

        const avatar = el(
          'div',
          'member-avatar avatar-blue',
          member.name.slice(0, 2).toUpperCase(),
        );
        const hint = el('small', '', '');
        const info = el('div', 'member-info');
        info.append(el('strong', '', member.name), hint);

        const shareText = el('strong', '', '');
        const input = el('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.01';
        input.hidden = true;

        if (
          editingExpense &&
          editingExpense.splitInputs &&
          editingExpense.splitInputs[member.id] !== undefined
        ) {
          input.value = editingExpense.splitInputs[member.id];
        }

        const share = el('div', 'member-share');
        share.append(shareText, input);

        checkbox.addEventListener('change', updateSplit);
        input.addEventListener('input', updateSplit);

        row.append(checkbox, avatar, info, share);
        memberList.appendChild(row);
        memberRows.push({
          member: member,
          checkbox: checkbox,
          input: input,
          shareText: shareText,
          hint: hint,
        });
      });

      updateSplit();
    }

    // Live split preview
   
    function updateSplit() {
      const splitType = splitTypeInput.value;
      const amount = Number(amountInput.value) || 0;
      const code = currencySelect.value;
      const ids = getSelectedIds();
      const result = buildExpenseNumbers(
        splitType,
        amount,
        ids,
        getTypedValues(),
        getCurrentRate(),
        getEqualSplitRotation(Number(houseSelect.value)),
      );

      memberRows.forEach(function (row) {
        const included = row.checkbox.checked;
        row.input.hidden = !(included && splitType !== 'equal');
        row.input.placeholder = splitType === 'percentage' ? '%' : code;

        const split = result.splits.find(function (s) {
          return s.memberId === row.member.id;
        });
        row.shareText.textContent =
          included && split ? formatCurrency(split.amount) : '—';

        if (!included) row.hint.textContent = 'Not included';
        else if (splitType === 'equal') row.hint.textContent = 'Equal share';
        else if (splitType === 'exact')
          row.hint.textContent = 'Type the amount (' + code + ')';
        else row.hint.textContent = 'Type the percentage (%)';
      });

      selectedCount.textContent =
        ids.length +
        (ids.length === 1 ? ' MEMBER SELECTED' : ' MEMBERS SELECTED');
      previewMemberCount.textContent =
        ids.length +
        (ids.length === 1 ? ' member selected' : ' members selected');

      let totalText = formatCurrency(amount, code);
      if (code !== HOUSE_CURRENCY && result.nairaAmount > 0) {
        totalText += ' ≈ ' + formatCurrency(result.nairaAmount);
      }
      previewTotal.textContent = 'Total expense: ' + totalText;
      summaryTotal.textContent = formatCurrency(
        result.nairaAmount || (code === HOUSE_CURRENCY ? amount : 0),
      );
      summaryMembers.textContent = ids.length;

      if (splitType === 'equal' && result.splits.length > 0) {
        summaryShare.textContent = formatCurrency(result.splits[0].amount);
      } else {
        summaryShare.textContent =
          splitType === 'equal' ? formatCurrency(0) : 'Custom';
      }

      if (result.error) {
        statusBadge.textContent = 'Needs attention';
        splitHelp.textContent = result.error;
      } else {
        statusBadge.textContent = 'Split is balanced';
        splitHelp.textContent =
          'Everything adds up. You can save this expense.';
      }
    }

    function updateHouseLabels(houseId) {
      const house = getData().houses.find(function (h) {
        return h.id === houseId;
      });
      previewHouseName.textContent = house ? house.name : 'Choose a house';
      previewHouseLabel.textContent = house
        ? house.address
        : 'No house selected';
    }

    function selectHouse(houseId) {
      setSelectedHouseId(houseId);
      updateHouseLabels(houseId);
      buildMemberRows(houseId);
      drawExpenseList(houseId);
      renderRecurringReminder(reminderBox, houseId, refreshAfterRecurring);
    }

    function refreshAfterRecurring() {
      const houseId = Number(houseSelect.value) || null;
      drawExpenseList(houseId);
      renderRecurringReminder(reminderBox, houseId, refreshAfterRecurring);
    }

    function setSplitType(type) {
      splitTypeInput.value = type;
      splitTabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.split === type);
      });
      updateSplit();
    }

    // Events

    houseSelect.addEventListener('change', function () {
      if (houseSelect.value === '') {
        memberRows = [];
        memberList.replaceChildren();
        payerSelect.disabled = true;
        reminderBox.replaceChildren();
        updateSplit();
        return;
      }
      selectHouse(Number(houseSelect.value));
    });

    splitTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setSplitType(tab.dataset.split);
      });
    });

    amountInput.addEventListener('input', updateSplit);
    currencySelect.addEventListener('change', loadRate);
    window.addEventListener('online', function () {
      if (currencySelect.value !== HOUSE_CURRENCY) loadRate();
    });

    selectNoneButton.addEventListener('click', function () {
      memberRows.forEach(function (row) {
        row.checkbox.checked = false;
      });
      updateSplit();
    });



    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const houseId = Number(houseSelect.value);
      const title = titleInput.value.trim();
      const amount = Number(amountInput.value);
      const ids = getSelectedIds();
      const splitType = splitTypeInput.value;
      const currency = currencySelect.value;

     
      if (!houseSelect.value) return showMessage('Choose a house.', false);
      if (!title) return showMessage('Enter a title for the expense.', false);
      if (!(amount > 0))
        return showMessage('Enter an amount greater than zero.', false);
      if (!categorySelect.value)
        return showMessage('Choose a category.', false);
      if (!dateInput.value) return showMessage('Choose a date.', false);
      if (!payerSelect.value) return showMessage('Choose who paid.', false);
      if (ids.length === 0)
        return showMessage(
          'Select at least one member to share this expense.',
          false,
        );

      const rate = getCurrentRate();
      if (!rate)
        return showMessage(
          'The exchange rate is not available. Check your connection or choose NGN.',
          false,
        );

      const numbers = buildExpenseNumbers(
        splitType,
        amount,
        ids,
        getTypedValues(),
        rate,
        getEqualSplitRotation(houseId),
      );
      if (numbers.error) return showMessage(numbers.error, false);

      const splitInputs = {};
      if (splitType !== 'equal') {
        ids.forEach(function (id) {
          splitInputs[id] = getTypedValues()[id];
        });
      }

      const keepsOriginalRate =
        editingExpense && editingExpense.currency === currency;
      const fields = {
        houseId: houseId,
        title: title,
        category: categorySelect.value,
        amount: numbers.nairaAmount, 
        currency: currency,
        originalAmount: amount, 
        exchangeRate: rate, 
        rateFetchedAt:
          currency === HOUSE_CURRENCY
            ? null
            : keepsOriginalRate
              ? editingExpense.rateFetchedAt
              : rateInfo.fetchedAt,
        paidBy: Number(payerSelect.value),
        participantIds: ids,
        splitType: splitType,
        splitInputs: splitInputs,
        splits: numbers.splits,
        date: dateInput.value,
        recurring: recurringCheck.checked,
      };

      const data = getData();
      let successMessage = 'Expense saved.';

      if (editingExpense) {
        const index = data.expenses.findIndex(function (e) {
          return e.id === editingExpense.id;
        });
        const old = data.expenses[index];
        fields.recurringId =
          old.recurringId || (fields.recurring ? old.id : undefined);
        data.expenses[index] = Object.assign({}, old, fields);
        successMessage = 'Expense updated.';
      } else {
        fields.id = makeId();
        fields.createdAt = new Date().toISOString();
        if (fields.recurring) fields.recurringId = fields.id;
        data.expenses.push(fields);
      }

      if (!saveData(data)) return;

      leaveEditMode();
      form.reset(); 
      showMessage(successMessage);
      drawExpenseList(houseId);
      renderRecurringReminder(reminderBox, houseId, refreshAfterRecurring);
    });

    form.addEventListener('reset', function () {
      setTimeout(function () {
        dateInput.value = todayString();
        setSplitType('equal');
        loadRate();

        const houseId = getSelectedHouseId();
        if (houseId !== null && !editingExpense) {
          houseSelect.value = houseId;
          buildMemberRows(houseId);
        }
      }, 0);
    });

    document
      .querySelector('.btn-cancel')
      .addEventListener('click', function () {
        leaveEditMode();
        formMessage.textContent = '';
      });

    cancelEditButton.addEventListener('click', function () {
      leaveEditMode();
      form.reset();
      formMessage.textContent = '';
    });


    // Edit mode
  
    function startEdit(expense) {
      editingExpense = expense;

      houseSelect.value = expense.houseId;
      houseSelect.disabled = true; 
      setSelectedHouseId(expense.houseId);
      updateHouseLabels(expense.houseId);
      buildMemberRows(expense.houseId);

      titleInput.value = expense.title;
      currencySelect.value = expense.currency || HOUSE_CURRENCY;
      amountInput.value =
        expense.originalAmount !== undefined
          ? expense.originalAmount
          : expense.amount;
      categorySelect.value = expense.category;
      dateInput.value = expense.date;
      payerSelect.value = expense.paidBy;
      recurringCheck.checked = expense.recurring === true;
      setSplitType(expense.splitType);
      loadRate();

      pageTitle.textContent = 'Edit Expense';
      saveButtonText.textContent = 'Update expense';
      cancelEditButton.hidden = false;
      formMessage.textContent = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function leaveEditMode() {
      editingExpense = null;
      houseSelect.disabled = false;
      pageTitle.textContent = 'Add an Expense';
      saveButtonText.textContent = 'Save expense';
      cancelEditButton.hidden = true;
    }


    function drawExpenseList(houseId) {
      if (houseId === null) {
        showEmpty(expenseList, 'Choose a house to see its expenses.');
        return;
      }

      const data = getData();
      const expenses = data.expenses
        .filter(function (e) {
          return e.houseId === houseId;
        })
        .sort(function (a, b) {
          return b.date.localeCompare(a.date);
        });

      if (expenses.length === 0) {
        showEmpty(
          expenseList,
          'No expenses yet. Add the first bill for this house.',
        );
        return;
      }

      expenseList.replaceChildren();

      expenses.forEach(function (expense) {
        const row = el('div', 'data-row');
        const info = el('div');

        let details =
          formatDate(expense.date) +
          ' · ' +
          expense.category +
          ' · paid by ' +
          getMemberName(data, expense.paidBy);
        if (expense.currency && expense.currency !== HOUSE_CURRENCY) {
          details +=
            ' · ' +
            formatCurrency(expense.originalAmount, expense.currency) +
            ' at ' +
            formatCurrency(expense.exchangeRate);
        }
        if (expense.recurring) details += ' · repeats monthly';

        info.append(
          el('strong', '', expense.title),
          el('small', 'd-block text-secondary', details),
        );

        const right = el('div', 'd-flex align-items-center gap-2');
        const editButton = el(
          'button',
          'btn btn-outline-primary btn-sm',
          'Edit',
        );
        editButton.type = 'button';
        editButton.addEventListener('click', function () {
          startEdit(expense);
        });

        const deleteButton = el(
          'button',
          'btn btn-outline-danger btn-sm',
          'Delete',
        );
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', function () {
          deleteExpense(expense);
        });

        right.append(
          el('strong', 'me-2', formatCurrency(expense.amount)),
          editButton,
          deleteButton,
        );
        row.append(info, right);
        expenseList.appendChild(row);
      });
    }

    function deleteExpense(expense) {
      const data = getData();
      const balances = calculateBalances(data, expense.houseId);
      const hasUnsettledBalance = balances.some(function (balance) {
        return Math.abs(balance.net) >= 0.005;
      });

      if (hasUnsettledBalance) {
        if (window.showAppToast)
          window.showAppToast(
            'This expense cannot be deleted while this house still has money to pay or receive. Settle the outstanding balances first.',
            'error',
          );
        return;
      }

      if (
        !confirm(
          'Delete "' +
            expense.title +
            '" (' +
            formatCurrency(expense.amount) +
            ')? Balances will be recalculated.',
        )
      )
        return;

      data.expenses = data.expenses.filter(function (e) {
        return e.id !== expense.id;
      });
      saveData(data);

      if (editingExpense && editingExpense.id === expense.id) {
        leaveEditMode();
        form.reset();
      }

      drawExpenseList(expense.houseId);
      renderRecurringReminder(
        reminderBox,
        expense.houseId,
        refreshAfterRecurring,
      );
    }

    async function startPage() {
      try {
        const data = await initializeData();

        CURRENCIES.forEach(function (currency) {
          currencySelect.appendChild(
            new Option(currency.code + ' – ' + currency.name, currency.code),
          );
        });

        houseSelect.replaceChildren(new Option('Select a house', ''));
        data.houses.forEach(function (house) {
          houseSelect.appendChild(new Option(house.name, house.id));
        });

        dateInput.value = todayString();
        setSplitType('equal');

        const savedId = getSelectedHouseId();
        const exists = data.houses.some(function (h) {
          return h.id === savedId;
        });

        if (exists) {
          houseSelect.value = savedId;
          selectHouse(savedId);
        } else {
          drawExpenseList(null);
        }
      } catch (error) {
        console.error(error);
        showMessage(
          'Could not load data. Refresh the page and try again.',
          false,
        );
      }
    }

    startPage();
  }
  return {};
})();

/* balances.js */
const __balances = (() => {
  const { initializeData } = __data;
  const { calculateBalances, sumOfBalances } = __calculations;
  const { setupHouseSelect, formatCurrency, el, showEmpty } = __helpers;
  if (document.getElementById('balancesList')) {


    const houseSelect = document.getElementById('houseSelect');
    const balancesList = document.getElementById('balancesList');
    const sumCheck = document.getElementById('sumCheck');
    let appData = null;

    function describeBalance(net) {
      if (net > 0)
        return { text: 'Is owed ' + formatCurrency(net), css: 'text-success' };
      if (net < 0)
        return { text: 'Owes ' + formatCurrency(-net), css: 'text-danger' };
      return { text: 'You do not owe anything', css: 'text-success' };
    }

    function render(houseId) {
      sumCheck.textContent = '';

      if (houseId === null) {
        showEmpty(
          balancesList,
          'Create a house first on the Houses & Members page.',
        );
        return;
      }

      const allBalances = calculateBalances(appData, houseId);
      const balances = allBalances.filter(function (b) {
        return !b.member.archived;
      });

      if (balances.length === 0) {
        showEmpty(balancesList, 'This house has no members yet.');
        return;
      }

      const table = el('table', 'table align-middle');
      const head = el('thead');
      const headRow = el('tr');
      ['Member', 'Paid', 'Share of costs', 'Payments', 'Balance'].forEach(
        function (title) {
          headRow.appendChild(el('th', '', title));
        },
      );
      head.appendChild(headRow);

      const body = el('tbody');
      balances.forEach(function (balance) {
        const status = describeBalance(balance.net);
        const row = el('tr');
        row.append(
          el('td', 'fw-bold', balance.member.name),
          el('td', '', formatCurrency(balance.paid)),
          el('td', '', formatCurrency(balance.owed)),
          el('td', '', formatCurrency(balance.settled)),
          el('td', 'fw-bold ' + status.css, status.text),
        );
        body.appendChild(row);
      });

      table.append(head, body);

      const wrapper = el('div', 'table-responsive');
      wrapper.appendChild(table);
      balancesList.replaceChildren(wrapper);

      const total = sumOfBalances(allBalances);
      if (total === 0) {
        sumCheck.textContent =
          '✓ All balances add up to ' + formatCurrency(0) + '.';
        sumCheck.className = 'sum-check text-success';
      } else {
        sumCheck.textContent =
          '⚠ Something is wrong: balances add up to ' +
          formatCurrency(total) +
          ', not zero.';
        sumCheck.className = 'sum-check text-danger fw-bold';
        console.error('Balances do not sum to zero:', total, allBalances);
      }
    }

    async function startPage() {
      try {
        appData = await initializeData();
        render(setupHouseSelect(houseSelect, appData.houses, render));
      } catch (error) {
        console.error(error);
        balancesList.textContent =
          'Could not load balances. Refresh the page and try again.';
      }
    }

    startPage();
  }
  return {};
})();

/* settlements.js */
const __settlements = (() => {
  const { getData, saveData } = __storage;
  const { initializeData } = __data;
  const { calculateBalances, suggestRepayments } = __calculations;
  const {
    setupHouseSelect,
    formatCurrency,
    formatDate,
    getMemberName,
    makeId,
    todayString,
    el,
    showEmpty,
  } = __helpers;
  if (document.getElementById('paymentForm')) {

    const houseSelect = document.getElementById('houseSelect');
    const suggestionsList = document.getElementById('suggestionsList');
    const historyList = document.getElementById('historyList');
    const paymentForm = document.getElementById('paymentForm');
    const paymentFrom = document.getElementById('paymentFrom');
    const paymentTo = document.getElementById('paymentTo');
    const paymentAmount = document.getElementById('paymentAmount');
    const paymentMessage = document.getElementById('paymentMessage');
    let currentHouseId = null;

    function showMessage(message, success = true) {
      paymentMessage.textContent = message;
      paymentMessage.className = success
        ? 'form-message text-success'
        : 'form-message text-danger';
    }

    function savePayment(fromMemberId, toMemberId, amount) {
      const data = getData();

      data.settlements.push({
        id: makeId(),
        houseId: currentHouseId,
        fromMemberId: fromMemberId,
        toMemberId: toMemberId,
        amount: Math.round(amount * 100) / 100,
        date: todayString(),
        status: 'paid',
      });

      if (saveData(data)) render(currentHouseId);
    }

    function recordSuggestion(repayment) {
      const data = getData();
      const text =
        getMemberName(data, repayment.fromMemberId) +
        ' paid ' +
        getMemberName(data, repayment.toMemberId) +
        ' ' +
        formatCurrency(repayment.amount);

      if (window.showAppToast)
        window.showAppToast('Recording payment: ' + text, 'success');
      savePayment(
        repayment.fromMemberId,
        repayment.toMemberId,
        repayment.amount,
      );
    }

    function fillMemberDropdowns(data, houseId) {
      const members = data.members.filter(function (m) {
        return m.houseId === houseId && !m.archived;
      });

      [paymentFrom, paymentTo].forEach(function (select, index) {
        select.replaceChildren(
          new Option(index === 0 ? 'Who paid?' : 'Who received it?', ''),
        );
        members.forEach(function (m) {
          select.appendChild(new Option(m.name, m.id));
        });
      });
    }

    paymentForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const from = Number(paymentFrom.value);
      const to = Number(paymentTo.value);
      const amount = Number(paymentAmount.value);

      if (currentHouseId === null) {
        window.showAppToast('Create a house first.', 'error');
        return;
      }
      if (!paymentFrom.value || !paymentTo.value) {
        window.showAppToast(
          'Choose who is paying and who is receiving.',
          'error',
        );
        return;
      }
      if (from === to) {
        window.showAppToast('A person cannot pay themselves.', 'error');
        return;
      }
      if (!(amount > 0)) {
        window.showAppToast('Enter an amount greater than zero.', 'error');
        return;
      }

      const suggested = suggestRepayments(
        calculateBalances(getData(), currentHouseId),
      );
      const matchingDebt = suggested.find(function (item) {
        return (
          Number(item.fromMemberId) === from && Number(item.toMemberId) === to
        );
      });

      if (!matchingDebt) {
        window.showAppToast('You do not owe this member money.', 'warning');
        return;
      }
      if (amount > matchingDebt.amount + 0.001) {
        window.showAppToast(
          'The amount is more than you owe this member.',
          'warning',
        );
        return;
      }

      savePayment(from, to, amount);
      paymentForm.reset();
      window.showAppToast('Payment recorded successfully.', 'success');
    });

    function render(houseId) {
      currentHouseId = houseId;

      if (houseId === null) {
        showEmpty(
          suggestionsList,
          'Create a house first on the Houses & Members page.',
        );
        showEmpty(historyList, 'No payments yet.');
        return;
      }

      const data = getData();
      fillMemberDropdowns(data, houseId);

      const repayments = suggestRepayments(calculateBalances(data, houseId));

      if (repayments.length === 0) {
        showEmpty(suggestionsList, 'Everyone is settled up. 🎉');
      } else {
        suggestionsList.replaceChildren();
        suggestionsList.appendChild(
          el(
            'p',
            'text-secondary small',
            repayments.length +
              (repayments.length === 1
                ? ' payment clears'
                : ' payments clear') +
              ' every debt:',
          ),
        );

        repayments.forEach(function (repayment) {
          const row = el('div', 'data-row');
          const text =
            getMemberName(data, repayment.fromMemberId) +
            ' pays ' +
            getMemberName(data, repayment.toMemberId);

          const right = el('div', 'd-flex align-items-center gap-3');
          const button = el(
            'button',
            'btn btn-primary btn-sm',
            'Record payment',
          );
          button.type = 'button';
          button.addEventListener('click', function () {
            recordSuggestion(repayment);
          });
          right.append(
            el('strong', '', formatCurrency(repayment.amount)),
            button,
          );

          row.append(el('span', '', text), right);
          suggestionsList.appendChild(row);
        });
      }

      const history = data.settlements
        .filter(function (item) {
          return item.houseId === houseId;
        })
        .sort(function (a, b) {
          return b.date.localeCompare(a.date) || b.id - a.id;
        });

      if (history.length === 0) {
        showEmpty(historyList, 'No payments recorded yet.');
        return;
      }

      const table = el('div', 'table-responsive');
      const tableElement = el(
        'table',
        'table table-hover align-middle mb-0 payment-history-table',
      );
      const thead = el('thead', 'table-light');
      const headerRow = el('tr');
      ['Who paid', 'Who received', 'Date', 'Amount'].forEach(
        function (heading) {
          headerRow.appendChild(el('th', '', heading));
        },
      );
      thead.appendChild(headerRow);
      const tbody = el('tbody');

      history.forEach(function (item) {
        const row = el('tr');
        row.append(
          el('td', '', getMemberName(data, item.fromMemberId)),
          el('td', '', getMemberName(data, item.toMemberId)),
          el('td', '', formatDate(item.date)),
          el('td', 'text-success fw-semibold', formatCurrency(item.amount)),
        );
        tbody.appendChild(row);
      });

      tableElement.append(thead, tbody);
      table.appendChild(tableElement);
      historyList.replaceChildren(table);
    }

    async function startPage() {
      try {
        const data = await initializeData();
        render(setupHouseSelect(houseSelect, data.houses, render));
      } catch (error) {
        console.error(error);
        suggestionsList.textContent =
          'Could not load settlements. Refresh the page and try again.';
      }
    }

    startPage();
  }
  return {};
})();

/* activity.js */
const __activity = (() => {
  const { initializeData } = __data;
  const {
    setupHouseSelect,
    formatCurrency,
    formatDate,
    getMemberName,
    el,
    showEmpty,
  } = __helpers;
  if (document.getElementById('activityList')) {

    const houseSelect = document.getElementById('houseSelect');
    const searchInput = document.getElementById('searchInput');
    const memberFilter = document.getElementById('memberFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const monthFilter = document.getElementById('monthFilter');
    const clearButton = document.getElementById('clearFilters');
    const resultCount = document.getElementById('resultCount');
    const activityList = document.getElementById('activityList');

    let appData = null;
    let currentHouseId = null;

    function buildEntries(houseId) {
      const expenses = appData.expenses
        .filter(function (e) {
          return e.houseId === houseId;
        })
        .map(function (e) {
          return {
            kind: 'expense',
            id: e.id,
            date: e.date,
            sortKey: e.date + (e.createdAt || ''),
            title: e.title,
            amount: e.amount,
            category: e.category,
            memberIds: e.participantIds.concat([e.paidBy]),
            between: e.participantIds
              .map(function (id) {
                return getMemberName(appData, id);
              })
              .join(', '),
            detail:
              'Paid by ' +
              getMemberName(appData, e.paidBy) +
              ' · ' +
              e.category +
              (e.currency && e.currency !== 'NGN'
                ? ' · ' + formatCurrency(e.originalAmount, e.currency)
                : ''),
            status: 'Expense recorded',
          };
        });

      const payments = appData.settlements
        .filter(function (s) {
          return s.houseId === houseId;
        })
        .map(function (s) {
          return {
            kind: 'payment',
            id: s.id,
            date: s.date,
            sortKey: s.date + String(s.id),
            title: 'Payment',
            amount: s.amount,
            category: null,
            memberIds: [s.fromMemberId, s.toMemberId],
            between:
              getMemberName(appData, s.fromMemberId) +
              ' → ' +
              getMemberName(appData, s.toMemberId),
            detail: 'Payment',
            status: 'Paid',
          };
        });

      return expenses.concat(payments).sort(function (a, b) {
        return b.sortKey.localeCompare(a.sortKey);
      });
    }

    function matchesFilters(entry) {
      const search = searchInput.value.trim().toLowerCase();

      if (
        search &&
        (entry.kind !== 'expense' ||
          !entry.title.toLowerCase().includes(search))
      )
        return false;
      if (categoryFilter.value && entry.category !== categoryFilter.value)
        return false;
      if (
        memberFilter.value &&
        !entry.memberIds.includes(Number(memberFilter.value))
      )
        return false;
      if (monthFilter.value && entry.date.slice(0, 7) !== monthFilter.value)
        return false;
      return true;
    }

    function render() {
      if (currentHouseId === null) {
        resultCount.textContent = '';
        showEmpty(
          activityList,
          'Create a house first on the Houses & Members page.',
        );
        return;
      }

      const entries = buildEntries(currentHouseId);

      if (entries.length === 0) {
        resultCount.textContent = '';
        showEmpty(
          activityList,
          'No activity yet. Add the first bill for this house.',
        );
        return;
      }

      const shown = entries.filter(matchesFilters);
      resultCount.textContent =
        'Showing ' + shown.length + ' of ' + entries.length;

      if (shown.length === 0) {
        showEmpty(activityList, 'Nothing matches your filters.');
        return;
      }

      const wrapper = el('div', 'table-responsive');
      const table = el(
        'table',
        'table table-hover align-middle mb-0 activity-history-table',
      );
      const thead = el('thead', 'table-light');
      const header = el('tr');
      ['Date', 'Activity', 'Between', 'Amount', 'Status'].forEach(
        function (label) {
          header.appendChild(el('th', '', label));
        },
      );
      thead.appendChild(header);
      const tbody = el('tbody');

      shown.forEach(function (entry) {
        const row = el('tr');
        const activityCell = el('td');
        activityCell.appendChild(el('strong', '', entry.title));
        activityCell.appendChild(
          el('small', 'd-block text-secondary', entry.detail),
        );
        row.append(
          el('td', '', formatDate(entry.date)),
          activityCell,
          el('td', '', entry.between || '—'),
          el(
            'td',
            entry.kind === 'payment'
              ? 'text-success fw-semibold'
              : 'fw-semibold',
            formatCurrency(entry.amount),
          ),
          el('td', '', ''),
        );
        const status = row.lastElementChild;
        status.appendChild(
          el(
            'span',
            'badge ' +
              (entry.kind === 'payment'
                ? 'text-bg-success'
                : 'text-bg-primary'),
            entry.status,
          ),
        );
        tbody.appendChild(row);
      });

      table.append(thead, tbody);
      wrapper.appendChild(table);
      activityList.replaceChildren(wrapper);
    }

    function fillMemberFilter() {
      memberFilter.replaceChildren(new Option('All members', ''));
      appData.members
        .filter(function (m) {
          return m.houseId === currentHouseId;
        })
        .forEach(function (m) {
          memberFilter.appendChild(new Option(m.name, m.id));
        });
    }

    function changeHouse(houseId) {
      currentHouseId = houseId;
      fillMemberFilter();
      render();
    }

    [searchInput, memberFilter, categoryFilter, monthFilter].forEach(
      function (control) {
        control.addEventListener('input', render);
      },
    );

    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      memberFilter.value = '';
      categoryFilter.value = '';
      monthFilter.value = '';
      render();
    });

    async function startPage() {
      try {
        appData = await initializeData();
        currentHouseId = setupHouseSelect(
          houseSelect,
          appData.houses,
          changeHouse,
        );
        changeHouse(currentHouseId);
      } catch (error) {
        console.error(error);
        activityList.textContent =
          'Could not load activity. Refresh the page and try again.';
      }
    }

    startPage();
  }
  return {};
})();
