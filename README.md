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

During the development and testing phase, OTP verification is conditionally bypassed to ease user navigation:

* **Forgot Password workflow:** Bypassed in dev mode. Users can recovery passwords using their Employee ID or Registered Email directly.
* **User Login workflow:** Active by default. Requires entering the simulated OTP code from the prompt (e.g. `123456`).
* **Test Suites:** OTP checking is strictly enforced for integration test execution to verify system safety.

To update or toggle these flags:
* **Backend:** Edit [application.yml](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/java%20backend/ncl-itsm-config/src/main/resources/application.yml) and change `ncl.auth.bypass-otp` to `false`.
* **Frontend:** Open [ForgotPassword.tsx](file:///d:/GIANDEEP%20MAIN/NCL_ITSM_SOFTWARE_WEBSITE/react%20frontend/ncl-itsm-frontend/src/features/auth/ForgotPassword.tsx) and set `const BYPASS_OTP = false;`.

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

## 👥 Sandbox Accounts (For Local Evaluation)

Use the following offline credentials to evaluate different role-based views in the system:
* **IT Administrator:** Employee ID `90000001` (Password: `password`)
* **Support Engineer:** Employee ID `88291000` (Password: `password`)
* **Standard Employee:** Employee ID `12345678` (Password: `password`)
