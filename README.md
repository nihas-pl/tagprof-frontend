# Tagprof Frontend

React dashboard for managing Instagram mention automation and discount code distribution.

## Tech Stack

- **React**: 18.3.1
- **Vite**: 6.0.14 (Build tool and dev server)
- **Tailwind CSS**: 3.4.21 (Styling)
- **shadcn/ui**: Component library
- **React Router**: 7.0.2 (Routing)
- **TanStack Query**: 6.0.0 (Server state management)
- **Zustand**: 5.0.3 (Client state management with localStorage persistence)
- **Axios**: 1.7.9 (HTTP client)
- **Recharts**: 2.15.1 (Data visualization)
- **Sonner**: 2.0.0 (Toast notifications)

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Running Tagprof API backend (see `api/README.md`)

## Development Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# API Backend URL
VITE_API_BASE_URL=http://localhost:3000
```

For production:
```bash
VITE_API_BASE_URL=https://api.tagprof.com
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Header.jsx      # Top navigation
│   │   ├── Sidebar.jsx     # Side navigation
│   │   └── Layout.jsx      # Page layout wrapper
│   ├── pages/              # Route pages
│   │   ├── Login.jsx       # Email/OAuth login
│   │   ├── Signup.jsx      # Registration
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Mentions.jsx    # Mention management
│   │   ├── DiscountCodes.jsx # Code generation
│   │   ├── SentimentFilter.jsx # Threshold settings
│   │   └── Verification.jsx # Staff verification
│   ├── stores/             # Zustand state stores
│   │   ├── authStore.js    # Auth state (user, token)
│   │   └── settingsStore.js # App settings
│   ├── lib/
│   │   ├── api.js          # Axios API client
│   │   └── utils.js        # Utility functions
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json
```

## Key Features

### Authentication
- Email/password login and signup
- Google OAuth integration
- Instagram OAuth integration (for webhook access)
- Persistent auth state in localStorage
- Auto-redirect to login on 401 errors

### Dashboard
- Real-time metrics (mentions, DMs sent, conversion rate)
- Sentiment breakdown pie chart
- Mention trend line chart
- Recent mentions table

### Mentions Management
- Filter by sentiment (positive/neutral/negative)
- Filter by status (pending/approved/dm_sent/dm_failed/rejected)
- Search by Instagram username
- Pagination support
- Mention detail sheet with full information

### Discount Codes
- View all codes with status filtering
- Bulk code generation (up to 1000 codes)
- Stats dashboard (total, available, assigned, redeemed)
- Search codes

### Sentiment Filter
- Adjustable sentiment threshold slider
- Visual threshold zones (block/flag/auto-reply)
- Persistent settings in localStorage
- Blocked keywords management

### Staff Verification
- Large code input for easy entry
- Real-time validation on input
- Color-coded feedback (green/red/yellow)
- Code details display
- One-click redemption

## State Management

### Auth Store (Zustand)
```javascript
import { useAuthStore } from '@/stores/authStore'

// Get auth state
const { user, token, isAuthenticated } = useAuthStore()

// Login
setAuth(user, token)

// Logout
clearAuth()

// Update user
updateUser({ name: 'New Name' })
```

### Settings Store (Zustand)
```javascript
import { useSettingsStore } from '@/stores/settingsStore'

// Get sentiment threshold
const threshold = useSettingsStore((state) => state.sentimentThreshold)

// Update threshold
setSentimentThreshold(75)

// Get discount mode
const mode = useSettingsStore((state) => state.discountMode) // 'auto' or 'rotation'
```

### Server State (TanStack Query)
```javascript
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Fetch dashboard metrics
const { data, isLoading } = useQuery({
  queryKey: ['dashboard-metrics'],
  queryFn: async () => {
    const response = await api.dashboard.getMetrics()
    return response.data
  },
})

// Generate codes
const generateMutation = useMutation({
  mutationFn: async (count) => await api.discounts.bulkGenerate(count),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['discounts'] })
  },
})
```

## API Integration

All API calls go through `src/lib/api.js`:

```javascript
import { api } from '@/lib/api'

// Authentication
await api.auth.login(email, password)
await api.auth.signup(email, name, password)
await api.auth.logout()

// Dashboard
await api.dashboard.getMetrics()

// Mentions
await api.mentions.list({ page: 1, sentiment: 'positive' })
await api.mentions.get(mentionId)

// Discounts
await api.discounts.list({ page: 1, status: 'available' })
await api.discounts.bulkGenerate(count)

// Verification
await api.verification.check(code)
await api.verification.redeem(code)
```

## Building for Production

### 1. Build

```bash
npm run build
```

Output: `dist/` directory with optimized static files.

### 2. Preview Build

```bash
npm run preview
```

### 3. Deploy Options

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: Static Hosting (S3, Cloudflare Pages, etc.)
Upload the contents of `dist/` directory to your hosting provider.

**Important**: Configure redirects for SPA routing:
- Vercel: `vercel.json` already configured
- Netlify: Add `_redirects` file:
  ```
  /* /index.html 200
  ```
- Nginx:
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

## Environment Variables in Production

Set these in your hosting platform:

```bash
VITE_API_BASE_URL=https://api.tagprof.com
```

**Vercel/Netlify**: Set in dashboard under Settings → Environment Variables

## Styling

### Tailwind CSS

Utility-first CSS framework. Examples:

```jsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
  <Button variant="outline" size="sm">Click me</Button>
</div>
```

### shadcn/ui Components

Pre-built, customizable components in `src/components/ui/`:

```jsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
```

### Custom Theme Colors

Defined in `tailwind.config.js`:

```javascript
colors: {
  brand: '#E11D74',  // Primary pink
  // ... other colors
}
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Performance Optimization

- **Code Splitting**: Vite automatically splits code by route
- **Image Optimization**: Use WebP format for images
- **Lazy Loading**: Routes are lazy-loaded by default
- **Query Caching**: TanStack Query caches API responses (5 min stale time)
- **Bundle Size**: Monitor with `npm run build` output

## Troubleshooting

### API Connection Issues

Check CORS configuration in backend (`api/config/initializers/cors.rb`):
```ruby
origins ENV.fetch('FRONTEND_URL', 'http://localhost:5173')
```

### OAuth Redirect Fails

Ensure OAuth redirect URIs are configured in:
- **Google Console**: http://localhost:3000/auth/google_oauth2/callback
- **Meta Developer**: http://localhost:3000/auth/instagram/callback

### Build Fails

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Styles Not Loading

Rebuild Tailwind:
```bash
npm run dev
# Or force rebuild
rm -rf dist && npm run build
```

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant updates without full page reload. If HMR breaks:
1. Save the file again
2. Restart dev server: `npm run dev`

### React DevTools

Install React DevTools browser extension for component inspection and profiling.

### VS Code Extensions (Recommended)

- ESLint
- Tailwind CSS IntelliSense
- Prettier
- ES7+ React/Redux/React-Native snippets

## License

Proprietary - All rights reserved
