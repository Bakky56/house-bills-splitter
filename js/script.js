
import { calculateMemberBalances } from "./calculations.js";
import { initializeData } from "../data.js";
import { getData } from "../js/storage.js";

const greetingElement = document.getElementById("getHours");

const GREETING_KEY = "houseBillsGreeting";

function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good morning!";
  } else if (currentHour < 17) {
    return "Good afternoon!";
  } else {
    return "Good evening!";
  }
}

function updateGreeting() {
  const greeting = getGreeting();

  if (greetingElement) {
    greetingElement.textContent = greeting;
  }

  localStorage.setItem(GREETING_KEY, greeting);
}

updateGreeting();

setInterval(updateGreeting, 30 * 1000);

const amountOwedCard = document.getElementById("amountOwed");
const amountOwedToYouCard = document.getElementById("amountOwedToYou");
const netBalanceCard = document.getElementById("netBalance");
const totalSpendingCard = document.getElementById("totalSpending");

const currentHouseId = null;

let spendingChart = null;

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function renderSpendingChart(houseExpenses) {
  const spendingByCategory = houseExpenses.reduce(
    (totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] || 0) + expense.amount;

      return totals;
    },
    {}
  );

  const categories = Object.keys(spendingByCategory);
  const amounts = Object.values(spendingByCategory);

  const colors = {
    Rent: "#071B3E",
    Other: "#4F8BFF",
    Electricity: "#087A36",
    Food: "#A9C9F5",
    Fuel: "#6EF28A",
    Internet: "#777982",
  };

  const backgroundColors = categories.map(
    (category) => colors[category] || "#4F8BFF"
  );

  const ctx = document.getElementById("myChart");

  if (!ctx || typeof Chart === "undefined") {
    return;
  }

  if (spendingChart) {
    spendingChart.destroy();
    spendingChart = null;
  }

  spendingChart = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: categories,
      datasets: [
        {
          label: "House Expenses",
          data: amounts,
          backgroundColor: backgroundColors,
          borderWidth: 0,
          hoverOffset: 5,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",

      plugins: {
        legend: {
          display: true,
          position: "right",
        },

        title: {
          display: true,
          text: "Spending by Category",
        },

        tooltip: {
          callbacks: {
            label(context) {
              return `${context.label}: ${formatCurrency(context.raw)}`;
            },
          },
        },
      },
    },
  });
}

async function loadDashboard() {
  try {
    const data = await initializeData();

    if (!data || !Array.isArray(data.houses)) {
      throw new Error("Dashboard data is invalid.");
    }

    if (data.houses.length === 0) {
      totalSpendingCard.textContent = formatCurrency(0);
      amountOwedCard.textContent = formatCurrency(0);
      amountOwedToYouCard.textContent = formatCurrency(0);
      netBalanceCard.textContent = formatCurrency(0);

      renderSpendingChart([]);
      return;
    }

    // TODO: Replace null with the actual selected house ID.
    const houseExpenses = data.expenses.filter(
      (expense) => expense.houseId === currentHouseId
    );

    const totalSpending = houseExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    totalSpendingCard.textContent = formatCurrency(totalSpending);

    renderSpendingChart(houseExpenses);

    const houseMembers = data.members.filter(
      (member) => member.houseId === currentHouseId
    );

    const balances = calculateMemberBalances(
      houseExpenses,
      houseMembers
    );

    const currentUserId = data.currentUserId;
    const currentUserBalance = balances[currentUserId] ?? 0;

    // A negative balance means the user owes money.
    const amountOwed = Math.max(0, -currentUserBalance);

    // A positive balance means money is owed to the user.
    const amountOwedToYou = Math.max(0, currentUserBalance);

    const netBalance = currentUserBalance;

    amountOwedCard.textContent = formatCurrency(amountOwed);
    amountOwedToYouCard.textContent = formatCurrency(amountOwedToYou);
    netBalanceCard.textContent = formatCurrency(netBalance);
  } catch (error) {
    console.error("Dashboard loading failed:", error);

    totalSpendingCard.textContent = "Unable to load";
    amountOwedCard.textContent = "Unable to load";
    amountOwedToYouCard.textContent = "Unable to load";
    netBalanceCard.textContent = "Unable to load";
  }
}

loadDashboard();