# NCL HQ ITSM Platform

Welcome to the **NCL HQ IT Service Management (ITSM) Platform**, an enterprise-grade service desk, ticketing, and asset management ecosystem custom-designed for the NCL HQ.

This project is organized as a monorepo containing a multi-module Spring Boot Java backend and a Vite-based React frontend.

---

## 📂 Project Structure

* **[java backend](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/java%20backend)**: Multi-module Maven project implementing REST APIs, Active Directory/LDAP integration, ticket workflows, POI Excel reconciliation, and audit logs.
* **[react frontend](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/react%20frontend/ncl-itsm-frontend)**: Modern React 19 + TypeScript + Ant Design UI dashboard with state-managed Zustand stores and Axios routing.

---

## 🛠 Tech Stack

### Backend
* **Core:** Java 21, Spring Boot 3.2.5, Spring Security, JPA/Hibernate
* **Database:** H2 Database (In-Memory for Sandbox/Testing), PostgreSQL (Production migration baseline via Flyway)
* **Services:** Redis Cache, Spring Boot DevTools (Hot Reloading), Lombok

### Frontend
* **Core:** React 19, TypeScript, Vite
* **UI styling:** Ant Design 5, TailwindCSS, Recharts
* **State & Routing:** Zustand, React Router DOM, Axios

---

## 🚀 How to Run the Website

Follow these steps to launch the backend and frontend application servers:

### Prerequisites
1. **Java Development Kit (JDK 21)** or higher.
2. **Node.js (v18+)** and **npm** package manager.

---

### Step 1: Run the Backend Server

1. Open a terminal on your machine.
2. Navigate to the backend directory:
   ```powershell
   cd "d:\GIANDEEP MAIN\NCL_ITSM_SOFTWARE_WEBSITE\java backend"
   ```
3. Run the Spring Boot application using the project's bundled Maven wrapper:
   ```powershell
   .\.maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run -pl ncl-itsm-config
   ```

* **(Optional) Auto-Builder Watcher:** To enable automatic backend rebuilds on file save, open a second terminal in `java backend` and execute the watcher script:
  ```powershell
  .\dev-watch.ps1
  ```

---

### Step 2: Run the Frontend Client

1. Open a new terminal.
2. Navigate to the React frontend folder:
   ```powershell
   cd "d:\GIANDEEP MAIN\NCL_ITSM_SOFTWARE_WEBSITE\react frontend\ncl-itsm-frontend"
   ```
3. Launch the Vite development server:
   ```powershell
   npm run dev
   ```

---

## 🌐 Application Ports

Once both servers are successfully running, you can access them at:
* **Frontend Web Application:** [http://localhost:5173/](http://localhost:5173/)
* **Backend REST APIs:** `http://localhost:8080/`
* **Swagger/OpenAPI UI:** `http://localhost:8080/swagger-ui.html`

---

## ⚙️ Configuration & OTP Bypass Settings

To simplify development, QA, and testing, you can toggle OTP verification off or on:

* **When OTP Verification is ENABLED (Current Default):**
  - **User Login:** Requires entering any dummy OTP code (or leaving it blank) and clicking **Verify OTP**.
  - **Forgot Password:** Shows a simulation OTP banner containing a 6-digit code. Enter that code along with your new password to reset it.
* **When OTP Verification is DISABLED (Bypass Mode):**
  - **User Login:** Bypasses the OTP input screen entirely, logging you in instantly.
  - **Forgot Password:** Hides the OTP input and banner entirely, letting you reset your password using only your new password.

### How to Toggle OTP Verification:
1. **Backend:** In [application.yml](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/java%20backend/ncl-itsm-config/src/main/resources/application.yml), change `ncl.auth.bypass-otp` to `true` (to bypass) or `false` (to enforce).
2. **Frontend:** In [Login.tsx](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/react%20frontend/ncl-itsm-frontend/src/features/auth/Login.tsx) and [ForgotPassword.tsx](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/react%20frontend/ncl-itsm-frontend/src/features/auth/ForgotPassword.tsx), set `const BYPASS_OTP` to `true` (to bypass) or `false` (to enforce).

---

## 🧪 Running Tests & Code Quality Verifications

To verify code changes and run quality audits:

### Run Backend JUnit Suite
```powershell
cd "d:\GIANDEEP MAIN\NCL_ITSM_SOFTWARE_WEBSITE\java backend"
.\.maven\apache-maven-3.9.6\bin\mvn.cmd test
```

### Run Frontend Lint & Build
```powershell
cd "d:\GIANDEEP MAIN\NCL_ITSM_SOFTWARE_WEBSITE\react frontend\ncl-itsm-frontend"
npm run lint
npm run build
```

---

## 👥 Sandbox Accounts & Database Seeding

The application runs with an **in-memory H2 database** in development mode. To prevent database wipes on server restart from deleting all default sandbox users, we have implemented an automatic database seeder:

* **Automatic Seeding:** Every time the backend restarts, the default sandbox users below are automatically registered and seeded into the database.
* **Credentials (Password is `password` for all):**
  - **IT Administrator:** Employee ID `90000001` (Full Name: *David Sterling*)
  - **Support Engineer:** Employee ID `88291000` (Full Name: *Marcus Thorne*)
  - **Standard Employee:** Employee ID `12345678` (Full Name: *J. Henderson*)

---

## 📊 Dashboard Data Management

The dashboard is designed to be fully **dynamic and database-driven**. It does NOT use any mock, demo, or hardcoded sample data.

### Development/Empty-State Behavior

When the system has no tickets (e.g. on a fresh database or after a server restart with H2 in-memory), the dashboard displays a **clean, empty state**:

| Dashboard Component | Empty-State Behavior |
|---|---|
| **KPI Cards** (Pending, Resolved, In Discussion) | Display `0` with no comparison badges |
| **Recent Requests Table** | Shows "No requests available — No activity recorded yet" |
| **Engineer Work Queue** | Shows "No requests assigned — No active tasks in your queue" |
| **7-Day Intake vs Resolution Chart** | Renders flat lines at `0` with an overlay: "No data to display" |
| **SLA Compliance Pie Chart** | Renders a grey placeholder segment with center text `N/A — No Data` |
| **AI Maintenance Predictor** | Shows accuracy and scan as `N/A (No data)` |
| **System Status Widget** | Dynamically shows `Operational` (green) or `Offline` (red) based on live API connectivity |
| **Current Load Bar** | Starts at 5% baseline and scales with active ticket count |
| **Active Site / Technicians** | Counts unique assigned engineers from tickets (0 if none) |

### How Data Populates

1. **On Dashboard Load:** The frontend calls `GET /tickets` to fetch all ticket records from the backend database.
2. **Creating a New Ticket:** Uses `POST /tickets` to persist to the database, then automatically re-fetches the full ticket list to update all dashboard components.
3. **Updating Ticket Status:** Uses `PATCH /tickets/{id}/status` to update the backend, then re-syncs.
4. **Offline Fallback:** If the backend API is unreachable, the frontend gracefully falls back to local in-memory state so the UI doesn't crash.

### To see the dashboard populated with data:
1. Log in with any sandbox account.
2. Navigate to **New Request** and submit a service request.
3. Return to the **Dashboard** — all KPI cards, tables, charts, and widgets will reflect the new data in real time.

