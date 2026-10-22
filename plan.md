# House Bills Splitter — Project Plan

## 1. Overview
Responsive web app for people sharing a flat, hostel room or house. Tracks shared expenses,
shows who owes whom, and settles debts with as few payments as possible.

**Stack:** HTML5, CSS3, Bootstrap 5, vanilla JavaScript (ES modules), Fetch API with async/await,
Chart.js, browser Local Storage, ExchangeRate API.

## 2. Pages
| Page | File | Purpose |
| --- | --- | --- |
| Dashboard | `index.html` | Month total, biggest expense, category pie chart, paid-vs-share bar chart, recurring reminder |
| Houses & Members | `house-member.html` | Manage houses and members |
| Expenses | `expenses.html` | Add / edit / delete expenses, splits, currency, recurring |
| Balances | `balances.html` | Net balance per member, zero-sum check |
| Settlements | `settlements.html` | Fewest-payments suggestions, record payments, history |
| Activity | `activity.html` | All expenses and payments with filters and search |

## 3. Data (Local Storage)
- `houseBillsData` → `{ houses, members, expenses, settlements }`
- `houseBillsRates` → `{ rates, fetchedAt }` (exchange-rate cache)
- `houseBillsSelectedHouse` → the house currently being viewed

Members link to a house with `houseId` (single source of truth). Removed members with history are
flagged `archived` so old records still show their name.

## 4. Key rules
- **Money maths is done in whole kobo** to avoid floating-point errors.
- **Equal split:** the leftover kobo is handed out one each, in order, so shares add up exactly.
- **Exact amounts** must add up to the total; **percentages** must add up to 100%.
- **Balance** = paid − share + payments made − payments received. All balances in a house sum to zero.
- **Settle up:** split people into the maximum number of zero-sum groups (bit-mask DP, exact up to
  16 people), then settle each group with biggest-debtor → biggest-creditor payments.
- **Member removal:** blocked while owed/owing; archived if settled but in history; deleted if no history.
- **Currency:** store original amount, currency, naira amount and rate; old expenses never change
  when rates change. Rates cached for 12 hours; fall back to saved rates if the API fails.
- **Recurring:** a series is due when its newest bill is recurring and from an earlier month.

## 5. Files
```
index.html, house-member.html, expenses.html, balances.html, settlements.html, activity.html
data.json, README.md, PLAN.md
css/  styles.css, expenses.css
js/   storage.js, data.js, calculations.js, rates.js, recurring.js, helpers.js, sidebar.js,
      dashboard.js, house-page.js, expenses.js, balances.js, settlements.js, activity.js
```

## 6. Validation and edge cases
- Title not empty; amount > 0; valid date; payer chosen; at least one member shares the expense.
- Exact amounts and percentages must add up; foreign currency needs an available rate.
- Confirm before deleting expenses, members and houses.
- Storage reads and writes are wrapped in try/catch; damaged saved data is backed up before reset.
- Loading, error, offline and empty states for the exchange rate, charts and every list.
- Buttons that add data are disabled while working to prevent double-submits.

## 7. Definition of done
Every item in the assessment brief works, data survives a refresh, the UI is usable on a phone,
and the README explains each "You Decide" choice.
