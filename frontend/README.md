# Fraud Detection Forensic Systems - Frontend

Production-grade Next.js frontend for the Fraud Detection Forensic Systems platform.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Material UI (MUI)** v5 for components
- **React Query** (@tanstack/react-query) for data fetching
- **Axios** for HTTP client
- **Recharts** for data visualization
- **React Force Graph** for network visualization

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (default: `http://localhost:8000`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For production, set this to your deployed backend URL:
```env
NEXT_PUBLIC_API_URL=https://fraud-detection-backend.fly.dev/api
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── login/              # Login page
│   │   ├── dashboard/          # Dashboard page
│   │   ├── transactions/       # Transaction pages
│   │   ├── cases/              # Case pages
│   │   └── entities/           # Entity pages
│   ├── components/             # Reusable components
│   │   ├── Layout.tsx          # Main app layout
│   │   ├── RiskChip.tsx        # Risk level chip
│   │   ├── StatusChip.tsx      # Case status chip
│   │   ├── RoleGuard.tsx       # Role-based access control
│   │   └── ConfirmDialog.tsx   # Confirmation dialog
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # Axios instance
│   │   └── api-client.ts       # Typed API client
│   ├── providers/              # Context providers
│   │   ├── QueryProvider.tsx   # React Query provider
│   │   └── SnackbarProvider.tsx # Notifications provider
│   └── types/                  # TypeScript types
│       └── index.ts            # Type definitions
├── package.json
├── tsconfig.json
└── next.config.js
```

## Features

### Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Persistent sessions via localStorage
- Automatic token refresh handling

### Pages

1. **Dashboard** (`/dashboard`)
   - KPI cards (transactions, flagged, cases, potential loss)
   - Transaction volume charts
   - Risk distribution pie chart
   - Recent high-risk transactions table

2. **Transactions** (`/transactions`)
   - Filterable transaction list (DataGrid)
   - Risk level filtering
   - Customer/merchant search
   - View and flag actions

3. **Transaction Detail** (`/transactions/[id]`)
   - Full transaction metadata
   - Scoring details and explainability
   - Feature contributions
   - Quick actions (flag, block entity)

4. **Cases** (`/cases`)
   - Case list with status filtering
   - Create new case
   - Case detail view with timeline

5. **Case Detail** (`/cases/[id]`)
   - Case summary and status management
   - Timeline of events
   - Related transactions and entities
   - Add notes/events

6. **Entity Profile** (`/entities/[id]`)
   - Entity information
   - Transaction history
   - Case involvement
   - Network graph visualization

## API Integration

The frontend uses a strongly-typed API client (`src/lib/api-client.ts`) that mirrors the backend API:

- `auth.login()` - User authentication
- `transactions.list()` - List transactions with filters
- `transactions.get()` - Get transaction details
- `transactions.flag()` - Flag a transaction
- `cases.list()` - List cases
- `cases.get()` - Get case details
- `cases.create()` - Create a case
- `cases.updateStatus()` - Update case status
- `cases.addEvent()` - Add timeline event
- `entities.get()` - Get entity details
- `entities.getNetwork()` - Get entity network graph
- `entities.block()` - Block an entity

## Theming

The app supports light and dark themes with an enterprise-focused color palette:

- **Primary**: Muted blue (#1565c0)
- **Error**: Strong red (#c62828) for HIGH risk
- **Warning**: Amber (#f57c00) for MEDIUM risk
- **Success**: Soft green (#2e7d32) for LOW risk

Theme preference is stored in localStorage and can be toggled via the header icon.

## Role-Based Access Control

Roles from backend:
- `ADMIN` - Full access
- `INVESTIGATOR` - Case management, flagging
- `ANALYST` - View and comment
- `READ_ONLY` / `VIEWER` - View-only access

Use `<RoleGuard>` component to conditionally render UI based on roles.

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Testing

Basic test structure is in place. Add tests using Jest and React Testing Library:

```bash
npm test
```

## Use Case Audio Demos

The platform includes optional audio narration for the three use case demonstrations, powered by OpenAI's text-to-speech API.

### Purpose

Audio narrations provide guided walkthroughs of each use case scenario, explaining the workflow and features as users interact with the interface. This enhances the learning experience and helps new users understand the platform's capabilities.

### Configuration

**Required Environment Variables:**

- `OPENAI_API_KEY` - Your OpenAI API key (server-side only, never exposed to client)
- `NEXT_PUBLIC_DEMO_AUDIO_ENABLED` - Feature flag to enable/disable audio demos (`true` or `false`)

**Local Development:**

Add to `.env.local`:
```env
NEXT_PUBLIC_DEMO_AUDIO_ENABLED=true
OPENAI_API_KEY=your-openai-api-key-here
```

**Fly.io Deployment:**

Set secrets via Fly CLI:
```bash
fly secrets set OPENAI_API_KEY=your-openai-api-key-here
```

Add to `fly.toml` env block:
```toml
[env]
  NEXT_PUBLIC_DEMO_AUDIO_ENABLED = "true"
```

### How It Works

1. **Audio Generation:**
   - Audio is generated server-side using OpenAI's TTS API
   - Each use case has a pre-written narration script (~30-60 seconds)
   - Audio is generated on first access and cached in memory
   - Subsequent requests serve cached audio for performance

2. **Caching Strategy:**
   - Generated audio is cached in memory for the lifetime of the process
   - Cache key is the use case ID
   - Audio is served as MP3 with proper content-type headers
   - Cache headers set for browser caching

3. **API Endpoints:**
   - `GET /api/demo-audio/[useCase]` - Retrieve audio for a use case
   - `POST /api/demo-audio/[useCase]` - Regenerate audio (clears cache)

4. **Use Cases:**
   - `real-time-alert-triage` - Real-time alert triage workflow
   - `complex-case-investigation` - Case investigation workflow
   - `network-entity-analysis` - Entity network analysis workflow

### Customization

Narration scripts can be modified in `src/lib/demo-narration-scripts.ts`. To update audio:

1. Modify the script text in the file
2. Restart the server (cache will be cleared)
3. Or call `POST /api/demo-audio/[useCase]` to force regeneration

Voice settings can be adjusted in `src/app/api/demo-audio/[useCase]/route.ts`:
- Model: `tts-1` (standard) or `tts-1-hd` (higher quality)
- Voice: `nova` (professional, neutral) - other options: `alloy`, `echo`, `fable`, `onyx`, `shimmer`

### Security Notes

- OpenAI API key is **never** exposed to the browser
- All TTS calls happen server-side via Next.js API routes
- Audio generation is rate-limited by OpenAI API limits
- Feature can be completely disabled via environment variable

## Deployment

See the main README.md for Fly.io deployment instructions. The frontend can be deployed as a separate Fly.io app or served statically from the backend.

## Troubleshooting

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is running and accessible

### Authentication Issues

- Clear localStorage and re-login
- Check JWT token expiration
- Verify backend auth endpoint is working

### Build Issues

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires 20+)

## Contributing

See CONTRIBUTING.md in the root directory for guidelines.

