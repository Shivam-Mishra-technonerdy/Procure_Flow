# ProcureFlow: One-Click Local Launcher & Run Guide

This guide describes how to run and manage the **Supplier & Purchase Order Management System (ProcureFlow)** using the automated one-click launcher scripts.

---

## 🚀 Quick Start (One-Click)

### To Start Everything:
Simply double-click or run from command prompt / terminal:
```cmd
start-project.bat
```
*(Or in PowerShell: `.\scripts\start-project.ps1`)*

### What the Start Script Does:
1. **Verifies MySQL**: Checks if MySQL is listening on port `3306`. If stopped, it safely starts the installed MySQL Windows service (e.g. `MySQL80`).
2. **Checks Port 8080**:
   - If already listening, skips starting a duplicate backend.
   - If not listening, starts the packaged Spring Boot executable JAR in the background.
   - Streams all backend logs to `logs/backend.log`.
3. **Health Validation**: Polls `http://localhost:8080/api/health` until the backend reports `{"status":"UP"}`.
4. **Checks Port 5173**:
   - If already listening, skips starting a duplicate frontend.
   - If not listening, starts Vite (`npm run dev`) in the background.
   - Streams all frontend logs to `logs/frontend.log`.
5. **Opens Web Browser**: Automatically opens `http://localhost:5173` once both services are verified healthy.

---

## 🛑 How to Stop the Project

Double-click or run from command prompt / terminal:
```cmd
stop-project.bat
```
*(Or in PowerShell: `.\scripts\stop-project.ps1`)*

### What the Stop Script Does:
1. Terminates the Spring Boot backend process and frees port `8080`.
2. Terminates the Vite frontend development process and frees port `5173`.
3. Cleans up recorded PID files in `logs/`.
4. **Leaves MySQL running** safely so your database data remains intact and uninterrupted.

---

## 🌐 URLs & Service Endpoints

| Component | URL / Port | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | React + Vite + Tailwind CSS portal |
| **Backend REST API** | [http://localhost:8080/api](http://localhost:8080/api) | Spring Boot 3 REST controller base |
| **Backend Health Check** | [http://localhost:8080/api/health](http://localhost:8080/api/health) | Public JSON probe (`{"status":"UP"}`) |
| **Swagger UI Documentation** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive OpenAPI 3 explorer |
| **MySQL Database** | `localhost:3306` | Database: `supplier_po_db` |

---

## 🔑 Demo Login Accounts

All demo accounts use the standard password: `Password123`

| Role | Email Address | Responsibilities |
| :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | User management, supplier management, order approvals, system reports |
| **BUYER** | `buyer@example.com` | Create purchase orders, track order fulfillment, download PDF invoices |
| **SUPPLIER** | `supplier@example.com` | View assigned purchase orders, update delivery status to `DELIVERED` |

---

## 📋 Real-Time Logs

Log files are stored in the project's `logs/` directory:
- **Backend Logs**: `logs/backend.log`
- **Frontend Logs**: `logs/frontend.log`

To watch logs live in PowerShell:
```powershell
Get-Content -Path "logs/backend.log" -Wait -Tail 30
Get-Content -Path "logs/frontend.log" -Wait -Tail 30
```

---

## 🛠️ Troubleshooting

### 1. "Backend is offline. Run start-project.bat, then refresh this page."
- Check the backend status indicator on the login page (top-right of the sign-in card).
- Run `start-project.bat`.
- Inspect `logs/backend.log` for any database connection errors.

### 2. "MySQL is NOT running on port 3306"
- If MySQL is installed as a service, start it in an Administrator command prompt:
  ```cmd
  net start MySQL80
  ```
- Ensure the database `supplier_po_db` exists and credentials in `backend/src/main/resources/application.yml` match your local MySQL configuration.

### 3. Port Conflicts
- If port `8080` or `5173` was held open by an old orphaned process, run `stop-project.bat` to terminate it, or check with:
  ```powershell
  Get-NetTCPConnection -LocalPort 8080, 5173 -State Listen
  ```
