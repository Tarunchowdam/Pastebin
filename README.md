# Pastebin Application

A production-ready text-sharing application built with Next.js 14, TypeScript, and Vercel KV (Redis) for persistence. Users can create text pastes with optional expiry constraints (time-based or view-count based) and share them via unique URLs.

## Features

- **Create Pastes**: Share text content with optional expiry settings
- **Time-based Expiry**: Set TTL (Time To Live) in seconds
- **View-based Expiry**: Limit paste visibility by maximum number of views
- **Dual Constraint Support**: Pastes expire when either time or view limit is reached
- **Deterministic Time Testing**: Test mode support for automated testing
- **Secure Rendering**: XSS-safe content display
- **Persistent Storage**: Uses Vercel KV (Redis) to survive serverless deployments

## Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS with inline styles (production-ready, minimal dependencies)
- **Persistence**: Vercel KV (Redis)
- **ID Generation**: nanoid for unique paste identifiers
- **Deployment**: Vercel (optimized for serverless)

## Project Structure

```
pastebin-app/
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts          # Health check endpoint
│   │   ├── pastes/
│   │   │   └── route.ts          # Create paste endpoint
│   │   └── pastes/[id]/
│   │       └── route.ts          # Fetch paste endpoint
│   ├── p/
│   │   └── [id]/
│   │       └── page.tsx          # Paste view page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page with form
├── lib/
│   ├── storage.ts                # Vercel KV wrapper functions
│   └── types.ts                  # TypeScript interfaces
├── .env.example                  # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Local Setup Instructions

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Vercel account (for KV storage)

### Installation

1. **Clone or create the project directory**
   ```bash
   mkdir pastebin-app
   cd pastebin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Get your Vercel KV credentials:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new project or select existing one
   - Go to Storage → Create Database → KV
   - Copy the environment variables to your `.env.local` file:
     ```
     KV_URL=
     KV_REST_API_URL=
     KV_REST_API_TOKEN=
     KV_REST_API_READ_ONLY_TOKEN=
     
     # Optional: Enable test mode for deterministic time testing
     TEST_MODE=1
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### 1. Health Check
**GET** `/api/healthz`

Returns the health status of the application and persistence layer.

**Response:**
```json
{
  "ok": true
}
```

**Status Codes:**
- `200`: Service is healthy
- `503`: Persistence layer unavailable

### 2. Create Paste
**POST** `/api/pastes`

Creates a new paste with optional expiry constraints.

**Request Body:**
```json
{
  "content": "string (required, non-empty)",
  "ttl_seconds": "number (optional, ≥1)",
  "max_views": "number (optional, ≥1)"
}
```

**Response:**
```json
{
  "id": "nanoid",
  "url": "https://your-domain.com/p/nanoid"
}
```

**Status Codes:**
- `201`: Paste created successfully
- `400`: Invalid input (missing/empty content, invalid TTL or max_views)
- `500`: Internal server error

### 3. Fetch Paste (API)
**GET** `/api/pastes/:id`

Retrieves paste content and metadata. Each fetch decrements the view count.

**Response:**
```json
{
  "content": "string",
  "remaining_views": "number | null",
  "expires_at": "ISO string | null"
}
```

**Status Codes:**
- `200`: Paste retrieved successfully
- `404`: Paste not found, expired, or view limit reached
- `500`: Internal server error

### 4. View Paste (HTML)
**GET** `/p/:id`

Returns an HTML page displaying the paste content with XSS-safe rendering.

**Status Codes:**
- `200`: Paste displayed
- `404`: HTML page for unavailable/expired pastes

## Persistence Layer Explanation

### Vercel KV (Redis)

This application uses **Vercel KV** as the persistence layer. KV is a Redis-compatible, serverless database that:

1. **Survives Serverless Deployments**: Unlike in-memory storage, KV persists data across function invocations and deployments
2. **Automatic Scaling**: Handles high traffic without manual configuration
3. **Built-in Expiry**: Supports TTL (Time To Live) for automatic cleanup
4. **Edge Computing**: Deployed globally for low latency

### Data Storage Schema

Each paste is stored in Redis with the following structure:

```
Key: paste:{id}
Value: {
  id: string,
  content: string,
  created_at: number (timestamp),
  ttl_seconds: number | undefined,
  max_views: number | undefined,
  current_views: number
}
Expiry: ttl_seconds or 30 days (default)
```

### Key Design Decisions

1. **Dual Expiry Mechanism**:
   - TTL expires paste after specified seconds
   - Max views expires paste after N fetches
   - Paste expires when EITHER constraint is triggered first

2. **Atomic View Counting**:
   - View count is incremented atomically within the storage layer
   - Ensures consistency even with concurrent requests

3. **Deterministic Time Testing**:
   - When `TEST_MODE=1`, reads `x-test-now-ms` header for current time
   - Enables predictable testing of expiry logic
   - Falls back to system time if header absent

4. **Automatic Cleanup**:
   - Redis TTL ensures expired keys are automatically removed
   - Prevents memory leaks and reduces storage costs

5. **Security**:
   - Content is escaped in HTML view to prevent XSS attacks
   - Input validation on all API endpoints
   - Proper HTTP status codes for different error scenarios

## Testing

### Manual Testing

1. Create a paste without expiry:
   ```bash
   curl -X POST http://localhost:3000/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content": "Hello, World!"}'
   ```

2. Create a paste with TTL:
   ```bash
   curl -X POST http://localhost:3000/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content": "Expires in 60 seconds", "ttl_seconds": 60}'
   ```

3. Create a paste with max views:
   ```bash
   curl -X POST http://localhost:3000/api/pastes \
     -H "Content-Type: application/json" \
     -d '{"content": "Expires after 3 views", "max_views": 3}'
   ```

4. Fetch a paste:
   ```bash
   curl http://localhost:3000/api/pastes/{id}
   ```

### Automated Testing with Test Mode

Set `TEST_MODE=1` in your environment and use the `x-test-now-ms` header to control time for deterministic testing:

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Test paste", "ttl_seconds": 60}'

# Simulate time passing (90 seconds later)
curl http://localhost:3000/api/pastes/{id} \
  -H "x-test-now-ms: $(($(date +%s) * 1000 + 90000))"
```

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will detect Next.js automatically

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add your KV credentials from the Vercel KV dashboard

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

5. **Enable KV Storage**
   - Go to Storage → Create Database → KV
   - Link it to your project

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.#   P a s t e b i n  
 