# 💰 Personal Expense Tracker (Cash vs. UPI)

A fast, offline-first mobile and web personal finance application built for Indian users to track daily expenses with a focus on **Cash vs. UPI** payment methods, zero floating-point arithmetic errors, period-over-period financial analytics, monthly budget tracking, and CSV data export.

Built with **Expo SDK 57**, **React Native**, **TypeScript**, **Expo Router**, **SQLite**, and **Zustand**.

---

## 🚀 Key Features

- **⚡ Fast Expense Recording**: Instant entry with numeric amount input, instant UPI vs. Cash toggle, visual category grid, date presets (*Today, Yesterday, Custom*), and notes.
- **🇮🇳 Indian Financial Numbering & Minor Units**: All monetary amounts are stored internally as integer **paise** (1 Rupee = 100 paise) to prevent IEEE-754 floating-point inaccuracies, formatted using `formatINR` (Lakhs and Crores).
- **📊 Real-Time Visual Dashboard**:
  - Month & Year calendar browsing.
  - Prior-period comparison badge with accurate percentage changes.
  - Proportional UPI vs. Cash spending split bar.
  - Category breakdown progress bars.
  - Daily spending trend bar chart with peak highlight.
- **🎯 Monthly Budgeting**:
  - Configure monthly spending limit.
  - Real-time remaining budget and progress bar.
  - Warning alert at 80% threshold and prominent over-budget banner.
- **🔍 Advanced Search & Filtering**:
  - Date presets (*Today, Yesterday, This Week, This Month, Last Month, Custom Range*).
  - Combinable filters for payment method, category, and min/max amount.
  - Interactive active filter chips with one-tap dismissal.
- **📈 Comprehensive Reports & Factual Insights**:
  - Weekly, Monthly, and Yearly comparison modes.
  - Executive metrics (*Average spend per day, Peak spending day, Total transaction count*).
  - Data-backed analytical insights engine.
- **🏷️ Category Management**:
  - 14 pre-seeded Indian expense categories (*Food & Dining, Groceries, Tea/Coffee, Bills, Fuel, etc.*).
  - Create custom categories with custom icons and colors.
  - Deletion safeguards preventing removal of categories with existing transactions.
- **📂 RFC-4180 CSV Export**:
  - Download or share complete transaction history as a standard CSV spreadsheet.
- **🎨 Modern Fintech Theme**:
  - System, Light, and Dark mode support with accessible touch targets.
- **🔒 100% Offline & Private**:
  - Local SQLite database (`expo-sqlite` on mobile / `wa-sqlite` WebAssembly on web). No remote data tracking.

---

## 🛠️ Technology Stack

- **Framework**: [Expo SDK 57](https://docs.expo.dev/) + [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language**: TypeScript
- **Database**: SQLite via `expo-sqlite` (Mobile) & `wa-sqlite` (Web WebAssembly)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [lucide-react-native](https://lucide.dev/)
- **Testing**: [Jest](https://jestjs.io/) (8 test suites, 34 tests)
- **Hosting / Deployment**: Vercel (Web SPA) & Expo Go (Mobile)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
# Start Expo Metro bundler
npm start

# Or run directly on Web
npm run web
```

### 3. Run on Mobile (Expo Go)
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Ensure your phone and PC are on the same Wi-Fi network.
3. In Expo Go, enter your local IP connection URL:
   ```
   exp://<YOUR_LOCAL_IP>:8081
   ```

### 4. Run Automated Unit Tests
```bash
npm test
```

### 5. Type Check
```bash
npm run typecheck
```

---

## 🌐 Deploy to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: complete personal expense tracker"
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `Expense_Tracker` repository.
4. Click **Deploy**. Vercel will build the web bundle using `npm run build` and output directory `dist`.

---

## 📄 License
MIT License
