# 🚀 VendorBridge: Procurement & Vendor Management ERP

VendorBridge is a lightweight, high-performance, role-based mini Enterprise Resource Planning (ERP) application engineered to automate the business-to-business (B2B) purchasing pipeline. It mirrors core industrial ERP modules (like Odoo or SAP) by managing the entire transactional lifecycle: from Request for Quotation (RFQ) creation to automated invoice compilation.

---

## 🛠️ Core Tech Stack

*   **Frontend / Client Frame**: Next.js 14+ (App Router, React Server & Client Components)
*   **Styling Engine**: Tailwind CSS (Responsive Utility-First Layouts)
*   **Backend Server Engine**: Python (FastAPI / Flask), Uvicorn ASGI server
*   **Database Engine**: SQLite (Relational DB for instant, transaction-safe state changes)
*   **Authentication Engine**: Mock Session Context Routing with a Developer-Override System

---

## 🗺️ System Roles & Permissions Matrix

The ERP enforces strict Role-Based Access Control (RBAC) to isolate business operations:

1.  **👮 Procurement Officer**: Drafts/Publishes RFQs, accesses the Side-by-Side Quotation Comparison Engine, generates Purchase Orders (POs) and Invoices.
2.  **🏪 Vendor**: Views open requests, submits competitive bids (Quotations), tracks real-time win/loss analytics.
3.  **👔 Manager / Approver**: Evaluates selected quotes, applies business logic controls, and executes explicit approval/rejection overrides with audit remarks.
4.  **🛠️ Admin**: Oversees system logs, manages vendor onboarding pipelines, and monitors cross-platform transactional metrics.

---

## 🔄 App Architecture & Workflow Lifecycle

```text
[ Procurement Officer ] ──> Creates RFQ (Draft -> Open)
                                  │
[ External Vendors ]    ──> Submit Quotations (Bids)
                                  │
[ Comparison Engine ]   ──> Auto-calculates L1 (Lowest Cost) Bid Metric
                                  │
[ Manager / Approver ]  ──> Evaluates & Grants Procurement Approval
                                  │
[ Legal Fulfillment ]   ──> Generates PO (Purchase Order) & Invoice Pipeline
```

---

## ⚡ Hackathon-Optimized Execution Highlights

*   **⚡ Side-by-Side Comparison Engine**: Auto-highlights the most optimal bid row using a localized matrix calculation array method.
*   **🔒 Presentation Session-Override**: The login panel includes a rapid "Developer Mode Dropdown" allowing evaluators to switch between all 4 system roles instantly without re-typing authentication credentials.
*   **🖨️ Zero-Weight PDF Execution**: Utilizes standard browser window print routines paired with a CSS `@media print` layout schema to bypass heavy server-side canvas generation delays.
*   **📨 Deep-Link Mail Engine**: Compiles dynamic invoice tokens directly into native system standard mail deep links (`mailto:` structure) to trigger local transactional notifications without risking firewall or SMTP blocks.

---

## 📂 Project Directory Structure

```text
vendorbridge/
├── backend/
│   ├── main.py              # Main Python API Engine
│   ├── database.py          # SQLite connection and session initialization
│   ├── models.py            # Relational database entities schema
│   ├── requirements.txt     # Python Dependencies
│   └── .env.example         # System configuration blueprint
├── frontend/                # Next.js Application Root
│   ├── src/
│   │   ├── app/             # App Router Core Routing Matrix
│   │   │   ├── layout.js    # Global layout viewport wrapper
│   │   │   ├── page.js      # Dashboard entry hub & switchboard
│   │   │   └── login/       # Target auth view layout
│   │   └── components/      # Reusable dashboard layouts & shared widgets
│   ├── package.json
│   └── .env.example         # UI API routing endpoint environment properties
└── README.md
```

---

## 🚀 Local Installation & Setup

Follow these quick commands to spin up the application on your workspace environment:

### Prerequisites
*   Python 3.8+ installed
*   Node.js v18.17+ installed (Required for modern Next.js environments)

### 1. Backend Configuration (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```
*The backend API server will spin up on: `http://localhost:8000`*

### 2. Frontend Configuration (Next.js)
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
*The client-side UI dashboard will spin up on: `http://localhost:3000`*

---

## 📝 Environment Variable Matrix

Never commit real keys. The application loads setup properties from native local environments matching this structure:

### Backend `.env` File Blueprint
```env
DATABASE_URL=sqlite:///./vendorbridge.db
JWT_SECRET=hackathon_secret_development_key
DEBUG_MODE=True
PORT=8000
```

### Frontend `.env` File Blueprint (Next.js Configuration)
*Note: In Next.js, keys prefixed with `NEXT_PUBLIC_` are safely exposed to the client side browser context.*
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
