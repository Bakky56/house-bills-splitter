# House Bills Splitter — Project Plan

## 1. Project Overview

**Project Name:** House Bills Splitter

**Project Type:** Responsive web application

**Team Size:** 2 developers

**Project Duration:** 1 week

**Technology Stack:**
- HTML5
- CSS3
- Bootstrap 5
- Vanilla JavaScript
- Fetch API and Async/Await
- JSON
- Browser Local Storage

## 2. Problem Statement

People living together often share expenses such as rent, electricity, fuel, food, and internet subscriptions. Tracking who paid, how much each person owes, and who needs to reimburse another person can become confusing when managed manually.

House Bills Splitter provides a simple way to manage households, record shared expenses, calculate individual shares, and track outstanding balances.

## 3. Project Objectives

- Allow users to create and manage multiple houses.
- Allow users to add, edit, and remove house members.
- Record shared household expenses.
- Support equal, exact-amount, and percentage-based expense splitting.
- Calculate each member's share and outstanding balance.
- Suggest simplified repayments between members.
- Record settlements between members.
- Store data in Local Storage so it persists after refreshing the browser.
- Provide a responsive, user-friendly interface.
- Handle loading, error, empty, and confirmation states.

## 4. Target Users

- Roommates sharing rent and utility bills.
- Students living together.
- Families managing household expenses.
- Groups sharing accommodation.

## 5. Main Application Pages

### A. Dashboard — `index.html`

- Display total houses, members, and expenses.
- Display total spending.
- Show recent expenses.
- Show outstanding balances and settlement summaries.
- Provide quick actions for common tasks.

### B. Houses and Members — `houses.html`

- Display all houses.
- Create and edit houses.
- View house details.
- Add, edit, and remove members.
- Display members belonging to each house.
- Select the active house.
- Confirm destructive actions before deletion.

### C. Expenses — `expenses.html`

- Add, edit, and delete expenses.
- Select a house and payer.
- Choose a category: Rent, Electricity, Fuel, Food, Internet, or Other.
- Enter the amount, description, and date.
- Select participants sharing the expense.
- Support equal, exact-amount, and percentage-based splits.
- Validate all expense inputs.

### D. Balances — `balances.html`

- Show each member's total payments and assigned shares.
- Calculate outstanding balances.
- Identify who should receive money and who owes money.
- Display the balance for the selected house.

### E. Settlements — `settlements.html`

- Display suggested repayments between members.
- Record repayments.
- Show settlement history.
- Update balances after a settlement is recorded.

### F. Activity History — `activity.html`

- Display recent application activities.
- Record actions such as creating houses, adding expenses, and recording settlements.

## 6. Data Management

### Initial Data — `data.json`

Contains demo data for houses, members, expenses, settlements, and activities.

### Storage — `js/storage.js`

Responsible for saving, retrieving, and clearing application data in Local Storage.

### Initialization — `js/data.js`

- Check Local Storage for existing application data.
- Fetch `data.json` if no saved data exists.
- Validate the required collections.
- Save the initial data to Local Storage.
- Avoid overwriting existing user data on page reload.

### Calculations — `js/calculations.js`

Responsible for reusable calculations, including expense shares, member balances, and simplified repayments.

**Important:** New user-created data must be saved through JavaScript, not manually added to `data.json`. Local Storage is browser-specific and does not automatically synchronize data between different users or computers.

## 7. Proposed Data Structures

### House

- `id`
- `name`
- `address`
- `createdAt`
- `memberIds`

### Member

- `id`
- `name`
- `email`
- `role`
- `joinedAt`

### Expense

- `id`
- `houseId`
- `title`
- `category`
- `amount`
- `paidBy`
- `participantIds`
- `splitType`
- `splits`
- `date`
- `createdAt`

### Settlement

- `id`
- `houseId`
- `fromMemberId`
- `toMemberId`
- `amount`
- `date`
- `status`

### Activity

- `id`
- `houseId`
- `type`
- `description`
- `createdAt`

The team must agree on one consistent relationship model connecting houses and members. For this project, each house can maintain a `memberIds` array, while members use stable unique IDs. If members may belong to multiple houses, the application must support membership across houses.

## 8. Expense Splitting Rules

### Equal Split

Divide the expense equally among all selected participants. Handle rounding so all shares add up to the exact total.

### Exact-Amount Split

Allow users to specify each participant's share. The sum of all shares must equal the expense total.

### Percentage Split

Allow users to assign a percentage to each participant. The percentages must total 100%.

### Balance Calculation

**Net balance = Total amount paid − Total amount owed**

- Positive balance: the member should receive money.
- Negative balance: the member owes money.
- Zero balance: the member has settled their share.

## 9. Project File Structure

Each page will have its own HTML file, CSS file, and page-specific JavaScript entry point. Shared JavaScript modules will handle common data operations and calculations.


house-bills-splitter/
├── index.html
├── index.css
├── houses.html
├── houses.css
├── expenses.html
├── expenses.css
├── balances.html
├── balances.css
├── settlements.html
├── settlements.css
├── activity.html
├── activity.css
├── data.json
├── PLAN.md
├── README.md
└── js/
    ├── storage.js
    ├── data.js
    ├── calculations.js
    ├── dashboard.js
    ├── houses-page.js
    ├── expenses-page.js
    ├── balances-page.js
    ├── settlements-page.js
    └── activity-page.js


The team can create additional JavaScript modules if needed. Each HTML page must link to its corresponding CSS file and JavaScript entry point.

Bootstrap 5 will be used for responsive layouts and common UI components, while each page's CSS file will contain its custom styling.

## 10. Team Responsibilities

### Developer 1 — Dashboard and Expenses

- Build the dashboard interface and summary cards.
- Display recent expenses.
- Implement expense creation, editing, and deletion.
- Implement equal, exact, and percentage-based splits.
- Integrate the shared data and storage modules.

### Developer 2 — Houses and Members

- Build `houses.html` and `houses.css`.
- Implement house creation, viewing, editing, and deletion.
- Implement member creation, editing, viewing, and removal.
- Validate house and member information.
- Use the agreed data structure and shared storage functions.

### Shared Responsibilities

- Agree on data structures and interfaces before integration.
- Implement and test balances, settlements, and activity history.
- Review each other's code.
- Test the complete application.
- Update the README and prepare the final submission.

## 11. GitHub Collaboration

- Use one shared GitHub repository.
- Pull the latest changes before starting work.
- Use separate feature branches where practical.
- Avoid editing the same files simultaneously.
- Commit changes using descriptive messages.
- Merge and test changes before final submission.
- Communicate any changes to shared data structures.

Suggested branches:

- `feature/dashboard-expenses`
- `feature/houses-members`

## 12. Validation and Edge Cases

- Prevent empty house and member names.
- Validate email addresses when required.
- Prevent invalid member assignments.
- Validate expense amounts and dates.
- Ensure exact shares equal the expense total.
- Ensure percentages total 100%.
- Handle currency rounding correctly.
- Confirm before deleting houses, members, expenses, or settlements.
- Avoid leaving expenses linked to deleted members.
- Handle missing or invalid JSON data.
- Display loading, error, and empty states.
- Handle Local Storage errors where possible.
- Prevent duplicate submissions where appropriate.

## 13. Definition of Done

The application is ready for submission when:

- Users can manage multiple houses and members.
- Users can create and manage household expenses.
- All three splitting methods work correctly.
- Member balances are calculated accurately.
- Settlements update the appropriate balances.
- Data persists after refreshing the browser.
- Each page has its own HTML and CSS files.
- The interface is responsive.
- Loading, error, empty, and confirmation states work.
- The README includes setup instructions and project limitations.
- The team has tested the integrated application and fixed major bugs.
