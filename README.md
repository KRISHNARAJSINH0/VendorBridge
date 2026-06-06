# 🚀 VendorBridge: Procurement & Vendor Management ERP

VendorBridge is a lightweight, high-performance, role-based mini Enterprise Resource Planning (ERP) application engineered to automate the business-to-business (B2B) purchasing pipeline. It mirrors core industrial ERP modules (like Odoo or SAP) by managing the entire transactional lifecycle: from Request for Quotation (RFQ) creation to automated invoice compilation.

Built entirely within a unified Next.js framework, this project handles both frontend UI rendering and server-side database transaction logic natively.

---

## 🛠️ Core Tech Stack

*   **Framework**: Next.js 14+ (App Router, Server Actions, Client Components)
*   **Styling Engine**: Tailwind CSS (Responsive Utility-First Layouts)
*   **Database ORM**: Prisma (Type-safe database client queries)
*   **Database Engine**: SQLite (Zero-configuration file-based relational database)
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

*   **⚡ Integrated Server Actions**: Eliminates CORS issues and complex external API setups by querying the SQLite database directly from React UI components.
*   **⚡ Side-by-Side Comparison Engine**: Auto-highlights the most optimal bid row using a localized matrix calculation array method.
*   **🔒 Presentation Session-Override**: The login panel includes a rapid "Developer Mode Dropdown" allowing evaluators to switch between all 4 system roles instantly without re-typing authentication credentials.
*   **🖨️ Zero-Weight PDF Execution**: Utilizes standard browser window print routines paired with a CSS `@media print` layout schema to bypass heavy server-side canvas generation delays.
*   **📨 Deep-Link Mail Engine**: Compiles dynamic invoice tokens directly into native system standard mail deep links (`mailto:` structure) to trigger local transactional notifications without risking firewall blocks.

---

## 📂 Project Directory Structure

```text
vendorbridge/
├── prisma/
│   ├── schema.prisma        # Prisma Relational Data Model Definition
│   └── dev.db               # SQLite Local Database File (Auto-generated)
├── src/
│   ├── app/                 # App Router Core Routing Matrix
│   │   ├── layout.js        # Global layout viewport wrapper
│   │   ├── page.js          # Dashboard entry hub & switchboard
│   │   ├── login/           # Target auth view layout
│   │   └── api/             # Next.js API Routes (if using fetch)
│   ├── components/          # Reusable dashboard layouts & shared widgets
│   └── lib/
│       └── prisma.js        # Singleton Prisma DB Client Instance
├── package.json
├── .env.example             # Project environment properties template
└── README.md
```

---

## 🚀 Local Installation & Setup

Follow these quick commands to spin up the application on your workspace environment:

### Prerequisites
*   Node.js v18.17+ installed

### Step-by-Step Build Commands
```bash
# 1. Install modern framework dependencies
npm install

# 2. Create env file from template
cp .env.example .env

# 3. Generate the Prisma Client and migrate the SQLite DB schema
npx prisma migrate dev --name init

# 4. Spin up the development server
npm run dev
```
*The complete full-stack ERP dashboard will spin up on: `http://localhost:3000`*

---

## 📝 Environment Variable Matrix

Never commit real configurations. The application loads setup properties from local environments matching this template layout:

### Project `.env` File Blueprint
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="hackathon_secret_development_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
