# Supplier & Purchase Order Management System — Frontend (ProcureFlow)

Enterprise React single-page application for managing suppliers, purchase orders, approval workflows, and supplier deliveries with role-based access control (RBAC), JWT authentication, OpenPDF document exports, and Chart.js analytics.

---

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with JWT request interceptor & 401 response auto-logout)
- **Data Visualizations**: [Chart.js 4](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Environment Configuration

The frontend communicates with the Spring Boot REST backend. You can customize the backend base URL via an environment file:

Create a `.env` or `.env.local` file inside `frontend/`:

```env
# Spring Boot API endpoint (defaults to http://localhost:8080/api if omitted)
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 👥 Role Portals & Routes

The application enforces role-based access control with route guards (`RoleGuard`):

### 1. 🛡️ Administrator (`ROLE_ADMIN`)
- `/admin/dashboard`: Executive KPI cards, Chart.js Doughnut (Status breakdown) and Bar (Volume trends), and recent orders table.
- `/admin/approval-queue`: Dedicated approval queue for all `PENDING` purchase orders. Allows 1-click Approval or Rejection with mandatory justification remarks.
- `/admin/suppliers`: Full CRUD management for authorized vendors (search, category filters, add/edit modal, active status toggle, deletion).
- `/admin/users`: User management table (never exposes password hashes), role assignment, and supplier link.
- `/admin/reports`: Procurement audit metrics, spend breakdown by vendor, and JSON report export.

### 2. 🛒 Buyer (`ROLE_BUYER`)
- `/buyer/dashboard`: Requisition overview, quick metrics, and recent orders.
- `/buyer/orders/create`: Order placement form with active supplier selector, delivery date & notes, dynamic multi-item table with automatic subtotal, 8% tax, and grand total calculations.
- `/buyer/orders`: My orders table with status filter tabs, search, detailed inspect modal, and instant PDF invoice download.

### 3. 🚚 Supplier (`ROLE_SUPPLIER`)
- `/supplier/dashboard`: Vendor fulfillment metrics, vendor company name banner, and recent assigned orders.
- `/supplier/orders`: View **only** orders assigned to the supplier company. "Mark as Delivered" button is active **only** when an order is in `APPROVED` status. Strictly prevents approval, rejection, or user editing.

### 4. 📬 Shared & Common
- `/notifications`: Email simulation inbox displaying simulated SMTP headers, notification body, and timestamp.
- `/login`: Secure email/password login and 1-click demo role switcher.
- `/register`: Self-service user registration.

---

## 🔐 Default Demo Accounts

All pre-seeded demo accounts use the standard password: **`Password123`**

| Role | Email / Username | Direct Dashboard Route |
|---|---|---|
| **Admin** | `admin@example.com` / `admin` | `/admin/dashboard` |
| **Buyer** | `buyer@example.com` / `buyer` | `/buyer/dashboard` |
| **Supplier** | `supplier@example.com` / `supplier` | `/supplier/dashboard` |

*(You can also use the 1-click login buttons on the login page or the top navigation bar to switch roles instantly).*

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

### 3. Production Build
To create an optimized production bundle:
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```
