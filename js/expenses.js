
let exchangeRates = {};

const expenseCurrency = document.querySelector("#expenseCurrency");
const conversionRate = document.querySelector("#conversionRate");
const expenseForm = document.querySelector("#expenseForm");
const expenseTitle = document.querySelector("#expenseTitle");
const expenseAmount = document.querySelector("#expenseAmount");
const expenseCategory = document.querySelector("#expenseCategory");
const categoryButtons = document.querySelectorAll(".category-option");
const memberCheckboxes = document.querySelectorAll(".member-checkbox");

function currencyFormatter(amount, currency = expenseCurrency.value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency
    }).format(amount);
}

function convertToNaira(amount, currency = expenseCurrency.value) {
    if (currency === "NGN") {
        return amount;
    }

    const rate = exchangeRates[currency];

    if (!rate || !Number.isFinite(rate)) {
        return null;
    }

    return amount / rate;
}

function updateConversionRate() {
    const selectedCurrency = expenseCurrency.value;

    if (selectedCurrency === "NGN") {
        conversionRate.textContent = "₦1 = ₦1";
        return;
    }

    const rate = exchangeRates[selectedCurrency];

    if (!rate || !Number.isFinite(rate)) {
        conversionRate.textContent = "Conversion rate unavailable.";
        return;
    }

    const nairaPerUnit = 1 / rate;

    conversionRate.textContent =
        `1 ${selectedCurrency} = ${currencyFormatter(nairaPerUnit, "NGN")}`;
}

async function fetchData() {
    const url = "https://open.er-api.com/v6/latest/NGN";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== "success" || !data.rates) {
            throw new Error("Exchange rates are unavailable.");
        }

        exchangeRates = data.rates;

        updateConversionRate();
        calculateEqualSplit();
    } catch (error) {
        console.error("Fetch error:", error.message);
        conversionRate.textContent = "Unable to load exchange rate.";
    }
}

categoryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        categoryButtons.forEach(function(categoryButton) {
            categoryButton.classList.remove("active");
        });

        button.classList.add("active");
        expenseCategory.value = button.dataset.category;
    });
});

function calculateEqualSplit() {
    const amount = Number(expenseAmount.value) || 0;

    const selectedMembers = Array.from(memberCheckboxes).filter(function(member) {
        return member.checked;
    });

    const memberCount = selectedMembers.length;

    const share = memberCount === 0 ? 0 : amount / memberCount;
    const percentage = memberCount === 0 ? 0 : 100 / memberCount;

    memberCheckboxes.forEach(function(member) {
        const shareElement = document.querySelector(
            `[data-share="${member.value}"]`
        );

        const shareLabel = document.querySelector(
            `[data-share-label="${member.value}"]`
        );

        if (!shareElement || !shareLabel) {
            return;
        }

        const memberShare = member.checked ? share : 0;

        let displayShare = currencyFormatter(memberShare);

        if (expenseCurrency.value !== "NGN") {
            const nairaEquivalent = convertToNaira(
                memberShare,
                expenseCurrency.value
            );

            if (nairaEquivalent !== null) {
                displayShare += ` (${currencyFormatter(nairaEquivalent, "NGN")})`;
            }
        }

        shareElement.textContent = displayShare;
        shareLabel.textContent = member.checked
            ? `${percentage.toFixed(0)}% share`
            : "Not included";
    });

    console.log("Selected currency:", expenseCurrency.value);
    console.log("Total expense:", currencyFormatter(amount));
    console.log("Selected members:", memberCount);
    console.log("Each member pays:", currencyFormatter(share));
}

expenseCurrency.addEventListener("change", function() {
    updateConversionRate();
    calculateEqualSplit();
});

expenseAmount.addEventListener("input", calculateEqualSplit);

memberCheckboxes.forEach(function(member) {
    member.addEventListener("change", calculateEqualSplit);
});

fetchData();
calculateEqualSplit();