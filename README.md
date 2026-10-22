# House Bills Splitter

A responsive web app for people who share a flat, hostel room or house. Track
shared bills (rent, electricity, generator fuel, groceries, internet), see who
owes whom, and settle up with as few payments as possible.

Built with HTML, CSS, Bootstrap 5 and vanilla JavaScript. No frameworks, no build step.
Data is saved in the browser's `localStorage`.

## How to run it

The app uses JavaScript modules and `fetch`, which browsers **block when you
double-click an HTML file** (`file://`). Run a small local server instead:

- **VS Code:** install *Live Server*, right-click `index.html` → **Open with Live Server**.
- **Or Python:** run `python3 -m http.server 8000` in this folder, then open <http://localhost:8000>.

You need internet for Bootstrap, Font Awesome, Chart.js and exchange rates.
The first visit loads demo data ("Flat 3B") from `data.json`. To start fresh run
`localStorage.clear()` in the browser console and refresh.

## Features

| Area | What it does |
| --- | --- |
| Houses & members | Create several houses; add, rename and remove members |
| Expenses | Add / edit / delete (with confirmation); equal, exact-amount and percentage splits |
| Balances | Green = is owed, red = owes; a check that all balances add up to exactly ₦0.00 |
| Settle up | Fewest-payments suggestions, one-click "Record payment", or record any payment by hand |
| Recurring bills | Tick "Repeats every month"; each new month a reminder offers one-click add |
| Currency | Enter an expense in USD, GBP, EUR, GHS, ZAR or CAD; it is converted to naira on save |
| History | All expenses and payments, newest first; filter by member, category, month; search titles |
| Dashboard | This month's total, biggest expense, pie chart by category, paid-vs-share bar chart |

## "You Decide" answers

### 1. Removing a member who still owes or is owed money
**Blocked.** The app shows how much they owe / are owed and asks the user to settle up first.

*Why:* removing them would break the rule that all balances add up to zero (someone would be
owed money by a person who no longer exists), and the money is real.

When a member has a zero balance:
- **They appear in past expenses or payments** → they are *archived*: hidden from new expenses
  but their name stays in the history. Adding the same name again restores them.
- **They have no history** → they are deleted completely.

### 2. Where does the missing kobo go? (₦10,000 ÷ 3)
Work is done in whole **kobo** (integers) so there are no floating-point errors. ₦10,000 =
1,000,000 kobo. 1,000,000 ÷ 3 = 333,333 remainder 1. The leftover kobo is handed out **one each,
in order**, so the result is ₦3,333.34 + ₦3,333.33 + ₦3,333.33 = **₦10,000.00 exactly**. Nobody ever
pays more than one kobo extra. For percentage splits the last person absorbs any rounding difference.
(Code: `splitEqually` and `calculateSplits` in `js/calculations.js`.)

### 3. If exchange rates change tomorrow, should old expenses change?
**No.** Each expense stores the original amount, the currency, the converted naira amount **and the
rate used**. The housemate really paid ~₦X at the rate that day, and people may already have
settled based on it. If old expenses followed today's rate, balances would shift on their own and
settled debts would reappear. When you *edit* an expense and keep its currency, the original rate
is kept too. Only a new expense (or a changed currency) uses the latest rate.

### 4. Equal / percentage shares for foreign-currency expenses
Equal and percentage shares are split **after** converting to naira (splitting in dollars first would
round to whole US cents, and one cent is worth about ₦15). Exact amounts are typed in the foreign
currency, so they are converted in proportion using the largest-remainder method so that
the shares still add up exactly (`convertSplits`).

## How "Settle Up" finds the fewest payments

Each person has a balance: positive = owed, negative = owes. All balances add up to zero.

1. A group of *k* people whose balances add up to zero can always settle among themselves with
   *k − 1* payments.
2. So **payments = (people with a balance) − (number of zero-sum groups)**. Fewer payments means
   more separate groups.
3. `findZeroSumGroups` uses dynamic programming over all subsets of people (bit masks) to split
   people into the **maximum** number of zero-sum groups. This is exact for up to 16 people with a
   balance; larger houses fall back to one group (still correct, just not guaranteed minimal).
4. `settleGroup` clears each group: the biggest debtor pays the biggest creditor, repeat.

Example: Ada owes Tunde ₦2,000 and Tunde owes Chidi ₦2,000 → Tunde's balance is 0, so he drops out
and the app suggests **one** payment: Ada → Chidi ₦2,000.

Tested on 2,000 random houses: every debt was always cleared, and it never used more payments than
the simple "biggest pays biggest" method (it used fewer in some cases).

## Exchange rates and caching (`js/rates.js`)

- API: `https://open.er-api.com/v6/latest/NGN` (free, no key).
- Rates are cached in `localStorage`. `getRates()` only calls the API when the cache is **older than
  12 hours** (change `CACHE_MAX_AGE_HOURS` at the top of `rates.js`).
- **Loading:** "Loading exchange rate..." while fetching (8-second timeout).
- **Error:** if the API fails but old rates exist, they are used and the user is told
  ("Could not reach the exchange-rate service. Using rates saved 5 hours ago.").
  If there are no saved rates at all, saving a foreign-currency expense is blocked with a clear message.
- **Offline:** detected with `navigator.onLine`; the app uses saved rates, and refreshes when the
  connection returns.
- Attribution ("Rates By Exchange Rate API") is shown in the sidebar and next to the rate.

## Recurring bills

An expense marked *Repeats every month* belongs to a "series". If the newest bill in a series is
from an earlier month, a reminder appears on the Dashboard and Expenses pages with an **Add now**
button. It copies the bill with today's date (foreign currencies use the latest rate; if offline,
the previous rate). To stop a series, edit its newest bill and untick the box.

## Project structure

house-bills-splitter/
├── index.html (dashboard), house-member.html, expenses.html,
│   balances.html, settlements.html, activity.html
├── data.json              demo data, loaded on the first visit only
├── css/styles.css, css/expenses.css
└── js/
    ├── storage.js         the ONLY file that touches localStorage (try/catch everywhere)
    ├── data.js            load saved data, or demo data, or empty
    ├── calculations.js    splits, rounding, balances, settle-up, month summary, recurring
    ├── rates.js           exchange-rate fetch + 12-hour cache
    ├── recurring.js       the "bills due" reminder box
    ├── helpers.js         currency/date formatting, small DOM helpers, house dropdown
    ├── sidebar.js         builds the menu on every page
    └── dashboard.js, house-page.js, expenses.js, balances.js, settlements.js, activity.js


## Data model (saved in localStorage)


{ houses: [], members: [], expenses: [], settlements: [] }

member:     { id, houseId, name, archived? }
expense:    { id, houseId, title, category, date,
              amount,            // in naira: what balances use
              currency, originalAmount, exchangeRate, rateFetchedAt,
              paidBy, participantIds, splitType, splitInputs, splits: [{ memberId, amount }],
              recurring, recurringId }
settlement: { id, houseId, fromMemberId, toMemberId, amount, date, status }

Balance = paid − share + payments made − payments received.

## Making common changes

- **Change the cache time:** edit `CACHE_MAX_AGE_HOURS` in `js/rates.js`.
- **Add a currency:** add a line to `CURRENCIES` in `js/rates.js`.
- **Add a split type:** add a branch in `calculateSplits` (`js/calculations.js`) and a `data-split`
  button in `expenses.html`.
- **Add a category:** add an `<option>` in `expenses.html` and `activity.html`, and a colour in
  `dashboard.js`.

## Limitations

- Data is stored per browser. It is not shared between people or devices, and there is no login.
- Naira is the only house currency.
- Houses with more than 16 members who all have a balance may get a valid but not always minimal settle-up.
- Recurring bills are monthly only.
