# Personal Expense Tracker — Product Requirements & Build Specification

## 1. Product Overview

Build a polished, mobile-first personal expense tracking application for Indian users.

The primary purpose of the app is to let users quickly record money they spend through:

- Cash
- UPI

The app should help users understand:

- How much they spent
- Where they spent it
- What categories consume the most money
- Cash vs UPI spending
- Daily/weekly/monthly spending
- Spending trends
- Spending compared with previous periods
- Individual transaction history
- Remaining budget/limit, if a budget is configured

The app should feel like a production-quality consumer finance app, not a basic CRUD application.

The user should be able to add an expense in a few seconds.

---

# 2. Core Product Principle

## Speed + Clarity + Accuracy

The application must optimize for three things:

1. Recording an expense should be extremely fast.
2. The dashboard should immediately explain spending.
3. Financial calculations must always be accurate.

Avoid unnecessary fields, screens, animations, or complicated workflows.

---

# 3. Target Platform

Primary platform:

- Mobile application
- Android first
- Architecture should allow future iOS support

Design must be mobile-first.

The UI should work comfortably on:

- Small phones
- Standard phones
- Large phones

Avoid desktop-oriented layouts.

---

# 4. Recommended Technology

Use the project's existing technology if one is already configured.

If starting from scratch, prefer:

- React Native
- Expo
- TypeScript

Recommended supporting technologies:

- State management: Zustand
- Local database/storage: SQLite
- Navigation: Expo Router
- Charts: react-native-gifted-charts or equivalent
- Forms/validation: React Hook Form + Zod
- Date handling: date-fns
- Icons: Lucide React Native

Important:

The app must work offline.

Do NOT make a backend mandatory for the core expense-tracking functionality.

All expense records should initially be stored locally on the device.

Design the data layer so cloud sync can be added later.

---

# 5. Application Scope

## MVP Features

The first production version must contain:

1. Dashboard
2. Add Expense
3. Edit Expense
4. Delete Expense
5. Transaction History
6. Search
7. Filters
8. Cash/UPI tracking
9. Categories
10. Date-based reporting
11. Spending comparison
12. Basic charts
13. Monthly summary
14. Settings
15. Data export
16. Backup/restore-ready architecture
17. Empty/loading/error states
18. Confirmation for destructive actions

---

# 6. Expense Data Model

Each expense should contain:

```ts
Expense {
  id: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI';
  categoryId: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
```

Optional future fields:

```ts
merchant?: string;
upiApp?: 'PHONEPE' | 'GPAY' | 'PAYTM' | 'OTHER';
location?: string;
receiptImage?: string;
tags?: string[];
```

Do not implement future fields unless required by the MVP.

---

# 7. Categories

Provide default categories.

Recommended categories:

- Food
- Groceries
- Shopping
- Transport
- Fuel
- Bills
- Entertainment
- Health
- Education
- Travel
- Rent
- Recharge
- Personal
- Other

Each category should have:

- id
- name
- icon
- color

Users should be able to:

- Add category
- Rename category
- Delete category
- Change category icon/color

Do not allow deletion of a category if transactions depend on it without first handling those transactions.

---

# 8. Add Expense Flow

This is the most important interaction in the application.

The user should be able to add an expense quickly.

## Required fields

### Amount

Large numeric input.

Example:

₹250

Amount must:

- Be greater than 0
- Support decimals if required
- Reject invalid values

### Payment Method

Two prominent options:

- Cash
- UPI

Default:

UPI or the user's last-used payment method.

Persist the last-used payment method locally.

### Category

Selectable category grid/list.

### Date

Default:

Today.

Allow selecting another date.

### Description

Optional.

Example:

"Lunch with team"

---

# 9. Add Expense UX

The screen should prioritize:

```text
Amount
        ₹250

Payment
[ Cash ] [ UPI ]

Category
[ Food ]

Date
[ Today ]

Note
[ Lunch ]

        + Add Expense
```

The Add Expense button must be visually prominent.

After successful submission:

- Save transaction
- Show success feedback
- Clear form
- Return to previous screen or dashboard
- Update dashboard immediately

Avoid unnecessary confirmation screens.

---

# 10. Quick Add

Dashboard should contain a prominent floating/action button:

```text
+
Add Expense
```

Optional quick-add interaction:

User taps + → Add Expense screen opens with amount input focused.

Keyboard should open automatically where appropriate.

---

# 11. Dashboard

Dashboard is the main screen.

It should answer:

> "How much have I spent?"

within a few seconds.

## Dashboard layout

### Header

```text
Good morning

September 2026
```

Allow changing the selected period.

---

## Total Spending Card

Example:

```text
Total Spent

₹18,450

vs previous month
↑ 12.4%
```

The comparison must be mathematically accurate.

---

# 12. Cash vs UPI

Display spending split:

```text
Payment Method

Cash       ₹6,450
UPI        ₹12,000
```

Also display percentages.

Example:

```text
Cash 35%
UPI 65%
```

Use a donut/pie chart where appropriate.

---

# 13. Category Breakdown

Display top spending categories.

Example:

```text
Where did your money go?

Food          ₹5,200
Shopping      ₹3,800
Transport     ₹2,400
Bills         ₹2,000
Other         ₹5,050
```

Show a horizontal progress/bar visualization.

Allow tapping a category to view transactions belonging to it.

---

# 14. Spending Trend

Provide a chart showing spending over time.

Depending on selected period:

### Daily

Show daily spending.

### Weekly

Show spending per day.

### Monthly

Show spending per month.

The chart must be readable on mobile.

---

# 15. Recent Transactions

Dashboard should show recent transactions.

Example:

```text
Recent Transactions

🍔 Food
Lunch
UPI                         ₹250
Today, 1:20 PM

⛽ Fuel
Petrol
UPI                         ₹1,000

🛒 Groceries
Cash                        ₹850
```

Show approximately 5 recent transactions.

Provide:

```text
View All
```

---

# 16. Transaction History

Dedicated transaction screen.

Features:

- List all expenses
- Search
- Filter
- Sort
- Date grouping

Example:

```text
September 17

Food
Lunch                         ₹250
UPI

Transport
Auto                          ₹120
Cash


September 16

Shopping
Clothes                       ₹1,500
UPI
```

Group transactions by date.

---

# 17. Search

Search transactions by:

- Description
- Category
- Merchant if merchant field exists

Search should update results as the user types.

Use debouncing if necessary.

---

# 18. Filters

Transaction history should support:

## Date

- Today
- Yesterday
- This week
- This month
- Last month
- Custom range

## Payment Method

- All
- Cash
- UPI

## Category

- All
- Individual categories

## Amount

Optional:

- Minimum amount
- Maximum amount

Filters should be combinable.

Show active filters clearly.

Provide:

```text
Clear All
```

---

# 19. Sorting

Allow sorting by:

- Newest first
- Oldest first
- Highest amount
- Lowest amount

Default:

Newest first.

---

# 20. Transaction Details

Tapping a transaction opens a detail screen/modal.

Show:

```text
₹1,250

Food

UPI

Lunch with friends

September 17, 2026
1:25 PM
```

Actions:

- Edit
- Delete

---

# 21. Edit Expense

User can modify:

- Amount
- Payment method
- Category
- Date
- Description

After save:

- Update database
- Recalculate dashboard
- Recalculate charts
- Recalculate comparisons

No stale state should remain anywhere.

---

# 22. Delete Expense

Delete must require confirmation.

Example:

```text
Delete expense?

This action cannot be undone.

[Cancel] [Delete]
```

After deletion:

- Remove record
- Recalculate all summaries
- Update UI immediately

---

# 23. Monthly Summary

Provide a dedicated summary/report screen.

Example:

```text
September 2026

Total Spent
₹42,850

Cash
₹12,450

UPI
₹30,400

Transactions
87

Average per day
₹2,523

Highest spending day
September 12
₹5,450
```

---

# 24. Period Comparison

The user should be able to compare:

- This week vs previous week
- This month vs previous month
- This year vs previous year

Example:

```text
September

₹42,850

August

₹38,200

Difference

₹4,650
+12.17%
```

Formula:

```text
difference = current - previous

percentageChange =
  previous === 0
    ? null
    : ((current - previous) / previous) * 100
```

If previous period is zero, do not display a misleading percentage.

Instead show:

```text
No previous spending
```

or:

```text
New spending
```

---

# 25. Important Financial Rules

All money calculations must use safe numeric handling.

Do not introduce floating-point errors.

Prefer storing amounts as integer minor units where practical.

For INR:

```text
₹250.50

storedAmount = 25050 paise
```

Then format for display:

```text
₹250.50
```

If the implementation uses decimal numbers instead, centralize all money calculations in a utility/service.

Never perform scattered calculations throughout components.

---

# 26. INR Formatting

The application targets Indian users.

Use Indian currency formatting:

```text
₹1,000
₹10,000
₹1,00,000
₹10,00,000
```

Create a centralized:

```ts
formatCurrency()
```

utility.

---

# 27. Budget Feature

Implement budget architecture but keep the MVP simple.

Allow the user to optionally set:

```text
Monthly Budget
₹50,000
```

Dashboard:

```text
Monthly Budget

₹42,850 / ₹50,000

₹7,150 remaining
```

Progress indicator.

If spending exceeds budget:

```text
₹52,400 / ₹50,000

₹2,400 over budget
```

Do not block expense creation when budget is exceeded.

---

# 28. Budget Categories

Future-ready architecture should allow:

```text
Food Budget: ₹8,000
Transport Budget: ₹5,000
Shopping Budget: ₹10,000
```

Do not necessarily implement category budgets in MVP unless development time permits.

---

# 29. Insights

Create simple factual insights based on transaction data.

Examples:

```text
You spent ₹4,200 on Food this month.

UPI spending accounts for 72% of your spending.

Your highest spending day was September 12.

You spent ₹3,200 more this month than last month.
```

Insights must be calculated from actual data.

Do not generate artificial financial advice.

---

# 30. Home Screen Information Hierarchy

Priority:

1. Total spending
2. Period
3. Cash vs UPI
4. Category breakdown
5. Spending trend
6. Recent transactions
7. Add expense

Do not overload the dashboard.

---

# 31. Navigation

Use bottom navigation.

Recommended:

```text
Home
Transactions
Reports
Settings
```

The Add Expense action should be a prominent central/floating action.

---

# 32. Settings

Settings should contain:

### General

- Currency
- Default payment method
- Default category

### Categories

- Manage categories

### Budget

- Monthly budget

### Data

- Export data
- Import/restore data

### Appearance

- Light mode
- Dark mode
- System default

### Security

Architecture should support future:

- App lock
- Biometric authentication

Do not implement complex authentication unless required.

---

# 33. Export

Allow users to export transactions.

CSV should contain:

```text
Date
Amount
Payment Method
Category
Description
Created At
```

Ensure exported data is valid CSV.

---

# 34. Backup Architecture

The application should be designed so local data can later be synchronized with a backend.

Do not tightly couple UI components directly to SQLite.

Use layers:

```text
UI
 ↓
State Management
 ↓
Repository / Service
 ↓
Local Database
```

For example:

```ts
ExpenseRepository
```

with methods:

```ts
getExpenses()
getExpenseById(id)
createExpense(expense)
updateExpense(expense)
deleteExpense(id)
getSummary()
getCategoryBreakdown()
getPaymentMethodBreakdown()
```

This makes future cloud sync easier.

---

# 35. State Management

Keep application state centralized.

Recommended state:

```text
expenses
categories
filters
dashboard
settings
budget
```

Avoid unnecessary global state.

Do not store derived values unnecessarily.

For example, do not store:

```ts
totalSpent
```

if it can safely be derived from transactions.

Prefer selectors/computed values.

---

# 36. Recommended Architecture

Use a clean modular structure.

Example:

```text
src/
  app/
    navigation/
    providers/

  features/
    expenses/
      components/
      screens/
      hooks/
      services/
      store/
      models/
      utils/

    dashboard/
      components/
      screens/
      services/
      store/

    reports/
      components/
      screens/
      services/

    categories/
      components/
      screens/
      services/

    budget/
      components/
      screens/
      services/

  database/
    migrations/
    database.ts
    repositories/

  shared/
    components/
    constants/
    utils/
    types/
    theme/

  assets/
```

Adapt this structure to the chosen framework.

Do not create excessive abstraction.

---

# 37. Database

Use SQLite for persistent local storage.

Tables:

## expenses

```text
id
amount
payment_method
category_id
description
date
created_at
updated_at
```

## categories

```text
id
name
icon
color
is_default
created_at
updated_at
```

## settings

```text
key
value
```

## budgets

```text
id
amount
month
year
created_at
updated_at
```

Use migrations.

Do not destroy existing user data during schema updates.

---

# 38. Database Indexes

Add indexes where useful.

At minimum consider:

```text
expenses.date
expenses.category_id
expenses.payment_method
```

This will become important as transaction history grows.

---

# 39. Performance Requirements

The application should remain responsive with:

- 1,000 transactions
- 5,000 transactions
- 10,000+ transactions

Avoid loading unnecessarily large datasets into memory.

Use database-level:

- Filtering
- Sorting
- Aggregation
- Pagination where appropriate

Charts should use aggregated data instead of rendering every transaction.

---

# 40. Offline First

Core functionality must work without internet.

User must be able to:

- Add expense
- Edit expense
- Delete expense
- View history
- Filter transactions
- View reports

without an internet connection.

No API call should be required for these operations.

---

# 41. Error Handling

Handle:

- Database errors
- Invalid amount
- Failed save
- Failed update
- Failed delete
- Export failure
- Import failure

Never silently swallow errors.

Show user-friendly messages.

Avoid exposing technical stack traces.

Example:

```text
Something went wrong while saving the expense.
Please try again.
```

---

# 42. Loading States

Every asynchronous operation should have an appropriate loading state.

Examples:

```text
Loading transactions...
Generating report...
Exporting data...
```

Avoid blank screens.

---

# 43. Empty States

Dashboard with no transactions:

```text
No expenses yet

Start tracking your spending by adding
your first expense.

[ + Add Expense ]
```

Transaction screen:

```text
No transactions found.
```

Filtered empty state:

```text
No expenses match your filters.

[ Clear Filters ]
```

---

# 44. Design System

Design should feel:

- Modern
- Clean
- Premium
- Minimal
- Financial/productivity oriented

Avoid:

- Excessive gradients
- Excessive shadows
- Too many colors
- Huge cards everywhere
- Cluttered dashboards

Use:

- Consistent spacing
- Strong typography hierarchy
- Rounded cards
- Clear icons
- Accessible contrast
- Subtle animations

---

# 45. Color Semantics

Use semantic colors consistently.

Primary:
- Main brand/action color

Success:
- Positive/remaining budget

Warning:
- Approaching budget

Danger:
- Over budget
- Delete action

Do not rely only on colors.

Use icons/text as additional indicators.

---

# 46. Dark Mode

Support:

- Light
- Dark
- System

Charts and cards must adapt to dark mode.

Do not hard-code colors inside individual components.

Use theme tokens.

---

# 47. Accessibility

Support:

- Screen readers
- Proper accessibility labels
- Sufficient touch target size
- Good contrast
- Keyboard-safe layouts
- Dynamic text where possible

Buttons should not be difficult to tap.

---

# 48. Date Handling

Use local device timezone.

Be careful when storing dates.

Do not accidentally shift a transaction date due to UTC conversion.

Separate:

- Transaction date
- Created timestamp

Transaction date should represent the date selected by the user.

---

# 49. Analytics Calculations

Create centralized functions/services for:

```ts
calculateTotalSpent()
calculateCashSpent()
calculateUpiSpent()
calculateCategoryTotals()
calculateDailyTotals()
calculateMonthlyTotals()
calculateAverageDailySpend()
calculateHighestSpendingDay()
calculatePercentageChange()
```

These functions should be unit tested.

---

# 50. Filtering Architecture

Represent filters as one object.

Example:

```ts
ExpenseFilters {
  startDate?: string;
  endDate?: string;
  paymentMethod?: 'CASH' | 'UPI';
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}
```

Do not create separate independent filtering implementations for every screen.

Use one reusable filtering/query layer.

---

# 51. Sorting Architecture

Example:

```ts
sortBy:
  'DATE_DESC'
  | 'DATE_ASC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC'
```

Centralize sorting behavior.

---

# 52. Responsive UI

Test at minimum:

- 320px width
- 360px
- 390px
- 430px

No:

- Horizontal overflow
- Cut-off buttons
- Text overlap
- Broken charts
- Hidden navigation

---

# 53. Form Validation

Amount:

```text
Required
> 0
Valid numeric value
Reasonable maximum
```

Category:

```text
Required
```

Payment method:

```text
Required
```

Date:

```text
Required
Valid date
```

Description:

```text
Optional
Reasonable character limit
```

---

# 54. Security & Privacy

The application contains financial information.

Important principles:

- Do not send expense data to a server in MVP.
- Do not log transaction details in production.
- Do not expose financial data in debug logs.
- Keep database access isolated.
- Prepare architecture for encrypted storage.
- Prepare architecture for biometric/app lock.

The app should clearly communicate that data is stored locally if that is the implementation.

---

# 55. Testing Requirements

Create tests for critical business logic.

## Unit tests

Test:

- Currency calculations
- Total spending
- Cash totals
- UPI totals
- Category totals
- Date filtering
- Search
- Amount filtering
- Percentage comparison
- Budget calculations

## UI tests

Test:

- Add expense
- Edit expense
- Delete expense
- Apply filter
- Clear filter
- Search
- Navigate between screens

---

# 56. Critical Test Cases

Example transactions:

```text
Food      ₹100 Cash
Food      ₹200 UPI
Travel    ₹300 UPI
```

Expected:

```text
Total = ₹600
Cash = ₹100
UPI = ₹500
Food = ₹300
Travel = ₹300
```

Comparison:

Current:

```text
₹1,200
```

Previous:

```text
₹1,000
```

Expected:

```text
Difference = ₹200
Percentage = 20%
```

Previous = 0:

```text
Percentage = null
```

Do not display:

```text
Infinity%
```

---

# 57. UX Details

Use optimistic UI only where safe.

After adding an expense:

```text
User taps Add
      ↓
Validate
      ↓
Save
      ↓
Update state
      ↓
Update dashboard
      ↓
Show success feedback
```

No page refresh should be required.

---

# 58. Notifications

Do not implement push notifications in MVP.

Architecture may later support:

- Daily spending reminder
- Budget warning
- Weekly spending summary

---

# 59. Future Features

Keep architecture extensible for:

### Income tracking

```text
Income
Expenses
Balance
```

### Accounts

```text
Cash Wallet
Bank Account
UPI Account
Credit Card
```

### Recurring expenses

```text
Rent
Subscriptions
EMI
```

### UPI integration

Potential future automatic transaction detection/import.

### Cloud synchronization

User account + encrypted cloud backup.

### Advanced analytics

- Spending trends
- Merchant analysis
- Category trends
- Monthly reports

### Receipt scanning

OCR-based expense entry.

### AI insights

Only as a future feature.

Do NOT implement these in MVP unless explicitly requested.

---

# 60. Important Product Decision

The application should NOT attempt to automatically read UPI transactions in MVP.

Users manually enter:

```text
Amount
Payment method
Category
Date
Description
```

This keeps the first version reliable, private, and simple.

---

# 61. UX Priority

## P0 — Critical

- Add expense
- View expenses
- Edit expense
- Delete expense
- Cash/UPI
- Categories
- Dashboard
- Filtering
- Search
- Reports
- Accurate calculations
- Local persistence

## P1 — Important

- Budget
- Export
- Dark mode
- Custom categories
- Spending comparisons

## P2 — Future

- Cloud backup
- Authentication
- Biometrics
- Notifications
- Recurring expenses
- Income
- Receipt scanning
- Automatic UPI imports

---

# 62. Development Strategy

Build incrementally.

## Phase 1 — Foundation

Implement:

- Project setup
- Theme
- Navigation
- Database
- Data models
- Repository layer
- Categories

Do not build charts yet.

---

## Phase 2 — Expense CRUD

Implement:

- Add expense
- Expense validation
- Edit
- Delete
- Transaction list
- Transaction detail

Ensure local persistence works.

---

## Phase 3 — Dashboard

Implement:

- Total spending
- Cash/UPI summary
- Recent transactions
- Category breakdown

---

## Phase 4 — Filters & Search

Implement:

- Search
- Date filters
- Category filters
- Cash/UPI filters
- Amount filters
- Sorting
- Clear filters

---

## Phase 5 — Reports

Implement:

- Spending trend
- Monthly summary
- Period comparison
- Highest spending day
- Average daily spending

---

## Phase 6 — Budget

Implement:

- Monthly budget
- Remaining amount
- Over-budget state
- Progress indicator

---

## Phase 7 — Settings & Export

Implement:

- Categories management
- Default payment method
- Theme
- Export CSV

---

## Phase 8 — Polish

Perform:

- UI refinement
- Accessibility
- Performance optimization
- Error handling
- Empty states
- Loading states
- Animation polish
- Edge-case testing

---

# 63. AI Agent Development Rules

The coding agent MUST follow these rules.

## Rule 1 — Inspect before modifying

Before changing existing code:

- Inspect project structure.
- Identify framework/version.
- Identify existing dependencies.
- Reuse existing architecture where sensible.

Do not replace the entire project unnecessarily.

---

## Rule 2 — Do not overengineer

Avoid unnecessary:

- Abstractions
- Services
- Hooks
- Components
- Dependencies
- State stores

Every abstraction should have a clear reason.

---

## Rule 3 — Reuse logic

Do not duplicate:

- Currency formatting
- Date formatting
- Filters
- Calculations
- Validation
- Theme values

Centralize reusable logic.

---

## Rule 4 — Business logic must not live inside UI

Do not put complex calculations inside screen components.

Prefer:

```text
Screen
 ↓
Hook / Store
 ↓
Service
 ↓
Repository
 ↓
Database
```

---

## Rule 5 — Keep UI components focused

Example:

```text
ExpenseCard
ExpenseForm
CategorySelector
PaymentMethodSelector
FilterSheet
SummaryCard
SpendingChart
```

Each component should have one clear responsibility.

---

## Rule 6 — No unnecessary dependencies

Before installing a package, determine whether the existing platform/library can solve the requirement.

Do not add packages for trivial functionality.

---

## Rule 7 — Preserve working functionality

Before modifying an existing feature:

1. Understand it.
2. Make the smallest necessary change.
3. Run tests/build.
4. Fix regressions.

---

## Rule 8 — Never fake functionality

Do not use setTimeout() to simulate real application behavior.

Do not hard-code dashboard values.

Do not create fake transaction data in production.

Use the actual database/state.

---

## Rule 9 — Handle edge cases

Always consider:

- Zero transactions
- Zero previous-period spending
- Very large amounts
- Decimal amounts
- Same-day transactions
- Future dates
- Deleted categories
- Empty search
- Multiple filters
- Offline operation
- Database errors

---

# 64. Definition of Done

A feature is NOT complete simply because the screen exists.

A feature is complete when:

- UI is implemented
- State is implemented
- Persistence works
- Validation works
- Error states work
- Empty states work
- Loading states work
- Edge cases are handled
- Tests exist for important business logic
- No console errors remain
- No TypeScript errors remain
- Mobile layout is responsive
- Dark mode works where applicable

---

# 65. Final Quality Requirements

## Functional

- [ ] User can add cash expense
- [ ] User can add UPI expense
- [ ] User can edit expense
- [ ] User can delete expense
- [ ] User can search
- [ ] User can filter
- [ ] User can sort
- [ ] User can view reports
- [ ] User can compare periods
- [ ] User can configure categories
- [ ] User can configure budget
- [ ] User can export transactions

## Data

- [ ] Data survives app restart
- [ ] Calculations are accurate
- [ ] No duplicate records
- [ ] Dates are correct
- [ ] Currency formatting is correct

## UX

- [ ] Add expense is fast
- [ ] Empty states exist
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Delete confirmation exists
- [ ] UI works on small screens
- [ ] Dark mode works
- [ ] Accessibility labels exist

## Engineering

- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] No unnecessary dependencies
- [ ] Business logic is tested
- [ ] Repository architecture exists
- [ ] Database migrations are safe
- [ ] No financial data is unnecessarily logged

---

# 66. Expected End Result

The finished application should feel like a polished personal finance product.

The core user journey should be:

```text
Open App
   ↓
See Today's / Monthly Spending
   ↓
Tap +
   ↓
Enter Amount
   ↓
Select Cash / UPI
   ↓
Select Category
   ↓
Save
   ↓
Dashboard Updates Immediately
   ↓
User Can Analyze Spending
   ↓
Filter / Search / Compare
```

The application should remain simple enough that a user can record an expense in seconds while still providing enough analytics to understand their spending habits.

Build the product in phases and verify each phase before moving to the next.

---

# 67. AI Agent Execution Prompt

Use this section as the direct instruction to the coding agent.

You are a senior mobile application engineer.

Build this application according to this specification.

IMPORTANT EXECUTION RULES:

1. Do not implement the entire application in one step.
2. First inspect the existing repository and identify:
   - Framework
   - Version
   - Existing architecture
   - Existing dependencies
   - Existing screens/components
   - Build/run commands
3. Reuse existing code when appropriate.
4. Do not rewrite the project unless absolutely necessary.
5. Implement one phase at a time in the order defined above.
6. After each phase:
   - Run type checking.
   - Run linting if available.
   - Run tests.
   - Fix errors.
   - Verify the implementation before proceeding.
7. Keep the implementation production-ready.
8. Avoid unnecessary dependencies.
9. Avoid unnecessary abstractions.
10. Never hard-code financial totals or analytics.
11. All calculations must use real persisted transaction data.
12. Keep financial calculations centralized and testable.
13. Make the application offline-first.
14. Keep the database layer separate from UI.
15. Do not add future features unless required for the current phase.
16. Do not create duplicate implementations of filtering, sorting, formatting, or calculations.
17. Handle empty, loading, error, and edge states.
18. Keep the UI polished and mobile-first.
19. Do not leave TODOs for core MVP functionality.
20. Do not claim a feature is complete until it has been implemented and verified.

TOKEN-EFFICIENCY RULES:

- Inspect only the files necessary for the current phase.
- Do not repeatedly print entire files.
- When modifying a file, show only the relevant change unless the full file is required.
- Reuse existing utilities/components.
- Avoid generating speculative code.
- Before creating a new dependency, verify whether an existing dependency can solve the problem.
- Before creating a new abstraction, verify whether an existing abstraction can be reused.
- Keep explanations concise and implementation-focused.

START HERE:

Phase 1 only.

First inspect the repository.

Then provide a concise implementation plan for Phase 1.

Do not start Phase 2 until Phase 1 is implemented, tested, and verified.
