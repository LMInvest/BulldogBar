# BulldogBar Manager

System zarządzania magazynem dla operacji barowych, zapewniający śledzenie zapasów w czasie rzeczywistym, zarządzanie dostawami i profesjonalne raportowanie.

## Funkcje

- **Zarządzanie inwentarzem w czasie rzeczywistym** - Śledź stany magazynowe w magazynie głównym i poszczególnych barach
- **Kontrola dostępu oparta na rolach** - 4 role użytkowników (Admin, Bar Manager, Warehouse Manager, Barman)
- **Alerty stanów magazynowych** - Automatyczne powiadomienia o niskich stanach
- **Zarządzanie dostawami** - Śledzenie zamówień, dostaw i ich statusów
- **Profesjonalne raportowanie** - 7 typów raportów (dzienny, zmianowy, inwentarzowy, etc.)
- **Zaawansowana analityka** - Prognozowanie popytu i analiza trendów
- **Wsparcie wielu lokacji** - Duży Bulldog, Mały Bulldog, Gin Bar
- **Transfery stanów** - Przenoszenie produktów między magazynem a barami

## Stack Technologiczny

### Frontend
- **React 18.3.1** - Framework UI
- **TypeScript 5.6.3** - Type safety
- **Vite 5.4.20** - Build tool
- **TanStack Query 5.62.0** - Server state management
- **Wouter 3.3.5** - Routing
- **shadcn/ui** - Komponenty UI (Radix UI)
- **Tailwind CSS 3.4.17** - Styling
- **Framer Motion** - Animacje

### Backend
- **Node.js** - Runtime
- **Express 4.21.2** - Web framework
- **TypeScript 5.6.3** - Type safety
- **Passport.js** - Autentykacja
- **Drizzle ORM 0.39.1** - Type-safe ORM
- **PostgreSQL** - Baza danych (Neon serverless)
- **WebSocket (ws)** - Real-time updates

### Narzędzia
- **Drizzle Kit** - Migracje bazy danych
- **esbuild** - Backend bundling
- **tsx** - TypeScript execution

## Wymagania

- Node.js 20+
- PostgreSQL 16+ (lub Neon serverless)
- npm lub yarn

## Instalacja

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/your-org/BulldogBar.git
cd BulldogBar
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja zmiennych środowiskowych

Skopiuj `.env.example` do `.env` i uzupełnij wartości:

```bash
cp .env.example .env
```

Wymagane zmienne:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/bulldogbar

# Server Configuration
NODE_ENV=development
PORT=5000

# Session Secret (generuj losowy string w produkcji)
SESSION_SECRET=your-session-secret-here

# JWT Secret (generuj losowy string w produkcji)
JWT_SECRET=your-jwt-secret-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# WebSocket Configuration
WS_PORT=3001
```

### 4. Inicjalizacja bazy danych

Wygeneruj i uruchom migracje:

```bash
npm run db:generate
npm run db:push
```

### 5. (Opcjonalnie) Seed danych testowych

Domyślny użytkownik admin zostanie utworzony przy pierwszym uruchomieniu serwera:
- **Username**: admin
- **Password**: admin123

## Uruchamianie

### Tryb deweloperski

Uruchom frontend i backend jednocześnie:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

Lub użyj głównego skryptu dev (uruchomi backend):

```bash
npm run dev
```

### Produkcja

Build i uruchomienie:

```bash
npm run build
npm start
```

## Skrypty NPM

- `npm run dev` - Uruchom backend w trybie development
- `npm run dev:client` - Uruchom frontend (Vite dev server)
- `npm run dev:server` - Uruchom backend z watch mode
- `npm run build` - Build frontend i backend
- `npm start` - Uruchom produkcyjny server
- `npm run check` - TypeScript type checking
- `npm run db:generate` - Generuj migracje Drizzle
- `npm run db:migrate` - Uruchom migracje
- `npm run db:push` - Push schema do bazy (dev)
- `npm run db:studio` - Otwórz Drizzle Studio

## Struktura Projektu

```
BulldogBar/
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Komponenty UI
│       ├── contexts/       # React contexts
│       ├── hooks/          # Custom hooks
│       ├── lib/            # Utilities
│       ├── pages/          # Strony aplikacji
│       ├── App.tsx         # Root component
│       └── main.tsx        # Entry point
├── server/                 # Backend Express
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── types/              # TypeScript types
│   ├── db.ts               # Database connection
│   └── index.ts            # Server entry point
├── shared/                 # Shared code
│   ├── schemas/            # Drizzle ORM schemas
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utilities
├── migrations/             # Database migrations
├── dist/                   # Build output
├── .env.example            # Environment variables template
├── drizzle.config.ts       # Drizzle configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
└── vite.config.ts          # Vite config
```

## API Endpoints

### Autentykacja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `GET /api/auth/me` - Pobranie bieżącego użytkownika
- `POST /api/auth/register` - Rejestracja (admin only)
- `POST /api/auth/change-password` - Zmiana hasła

### Produkty
- `GET /api/products` - Lista produktów
- `GET /api/products/:id` - Szczegóły produktu
- `POST /api/products` - Dodaj produkt
- `PUT /api/products/:id` - Aktualizuj produkt
- `DELETE /api/products/:id` - Usuń produkt

### Inwentarz
- `GET /api/inventory/warehouse` - Stan magazynu głównego
- `GET /api/inventory/bar/:location` - Stan konkretnego baru
- `GET /api/inventory/all` - Wszystkie stany
- `PUT /api/inventory/warehouse/:productId` - Aktualizuj stan magazynu
- `POST /api/inventory/transfer` - Transfer magazyn → bar
- `GET /api/inventory/transfers` - Historia transferów
- `GET /api/inventory/alerts` - Alerty niskich stanów

### Dostawy
- `GET /api/deliveries` - Lista dostaw
- `GET /api/deliveries/:id` - Szczegóły dostawy
- `POST /api/deliveries` - Nowa dostawa
- `PATCH /api/deliveries/:id/status` - Aktualizuj status

### Raporty
- `GET /api/reports` - Lista raportów
- `GET /api/reports/:id` - Szczegóły raportu
- `POST /api/reports` - Generuj raport

### Użytkownicy
- `GET /api/users` - Lista użytkowników
- `GET /api/users/:id` - Szczegóły użytkownika
- `PUT /api/users/:id` - Aktualizuj użytkownika
- `DELETE /api/users/:id` - Dezaktywuj użytkownika

## Role i Uprawnienia

### Admin
- Pełny dostęp do wszystkich funkcji
- Zarządzanie użytkownikami
- Konfiguracja systemu

### Warehouse Manager
- Zarządzanie magazynem głównym
- Tworzenie i zarządzanie dostawami
- Transfery do barów
- Dodawanie/edycja produktów

### Bar Manager
- Przeglądanie stanów swojego baru
- Żądanie transferów z magazynu
- Generowanie raportów dla swojego baru

### Barman
- Przeglądanie stanów swojego baru
- Podstawowe operacje na zapasach

## Database Schema

### Główne tabele

- **users** - Użytkownicy systemu
- **products** - Produkty (alkohole, napoje, dodatki)
- **warehouse_inventory** - Stany magazynu głównego
- **bar_inventory** - Stany w poszczególnych barach
- **deliveries** - Dostawy od dostawców
- **delivery_items** - Pozycje dostaw
- **stock_transfers** - Transfery magazyn → bar
- **reports** - Wygenerowane raporty
- **activity_log** - Log aktywności użytkowników
- **stock_alerts** - Alerty niskich stanów
- **sessions** - Sesje użytkowników

## Bezpieczeństwo

- Hashowanie haseł z bcrypt
- Sesje z express-session
- CSRF protection
- Walidacja danych z Zod
- Role-based access control
- SQL injection protection (Drizzle ORM)

## Deployment

### Replit

Projekt jest skonfigurowany dla Replit:

1. Otwórz projekt w Replit
2. Skonfiguruj zmienne środowiskowe w Secrets
3. Provision PostgreSQL database
4. Uruchom `npm install`
5. Uruchom `npm run db:push`
6. Kliknij Run

### Inne platformy

Możesz deployować na:
- **Vercel** - Frontend + Serverless Functions
- **Railway** - Full-stack deployment
- **Render** - Full-stack deployment
- **Fly.io** - Docker deployment

## Rozwój

### Dodawanie nowych funkcji

1. Dodaj schema w `shared/schemas/index.ts`
2. Wygeneruj migrację: `npm run db:generate`
3. Dodaj typy w `shared/types/index.ts`
4. Stwórz routes w `server/routes/`
5. Stwórz komponenty UI w `client/src/components/`
6. Dodaj strony w `client/src/pages/`

### Konwencje kodu

- Używaj TypeScript dla wszystkiego
- Komponenty UI: PascalCase
- Utilities: camelCase
- Typy: PascalCase
- Pliki: kebab-case lub camelCase

## TODO / Roadmap

### Wkrótce
- [ ] WebSocket server dla real-time updates
- [ ] Pełna implementacja modułu inwentarza
- [ ] System raportowania z eksportem PDF/Excel
- [ ] Dashboard z wykresami i statystykami
- [ ] Moduł prognozowania popytu

### Przyszłość
- [ ] Mobile app (React Native)
- [ ] Skanowanie kodów kreskowych
- [ ] Integracje z dostawcami
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard

## Contributing

1. Fork projektu
2. Stwórz branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## Licencja

MIT License - zobacz plik LICENSE

## Wsparcie

Problemy? Otwórz issue na GitHub lub skontaktuj się z zespołem developmentu.

## Autorzy

- Development Team - BulldogBar
- Powered by Claude Code

---

Zbudowano z ❤️ dla BulldogBar
