# VTC Story Ledger

**Key Player Journey Tracking for Virtual Table Contents**

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Week 0 setup guide (로그인 & Supabase 연동)
- **[MVP-DESIGN.md](../docs/MVP-DESIGN.md)** - Complete MVP design document
- **[PRD-v3.2-FINAL.md](../docs/PRD-v3.2-FINAL.md)** - Product requirements

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
- **Zustand** (State management)
- **React Router** (Routing)
- **Tailwind CSS** (Styling)
- **React Query** (Data fetching - coming in Week 1)

---

## 📁 Project Structure

```
vtc-app/
├── src/
│   ├── app/              # App configuration (router, layout)
│   ├── features/         # Feature modules
│   │   └── auth/        # Authentication feature
│   └── shared/          # Shared utilities & components
│       ├── types/       # TypeScript types
│       └── utils/       # Utilities (Supabase client, etc.)
├── .env.local           # Environment variables (not committed)
└── SETUP.md            # Setup guide
```

---

## 🧪 Test Credentials

After Supabase setup (see [SETUP.md](SETUP.md)):

**Logger Account**:
- Email: `logger@vtc.com`
- Password: `logger123!@#`

**Producer Account**:
- Email: `producer@vtc.com`
- Password: `producer123!@#`

---

## 📅 Development Roadmap

- [x] **Week 0**: Login & Supabase connection ← **Current**
- [ ] **Week 1**: KP Dashboard (Screen 1)
- [ ] **Week 2**: Hand Input (Screen 2 & 3) + Offline
- [ ] **Week 3**: Admin Dashboard + Photo Upload
- [ ] **Week 4**: Testing & Deployment

See [MVP-DESIGN.md](../docs/MVP-DESIGN.md) for detailed roadmap.

---

## 🤝 Contributing

This project follows the [CLAUDE.md](../CLAUDE.md) development workflow:
- Phase 0: PRD (Product Requirements Document)
- Phase 1: Code
- Phase 2: Test
- Phase 3: Version
- Phase 4: Git
- Phase 5: Verification
- Phase 6: Cache

---

**License**: MIT
**Created**: 2025-01-12
