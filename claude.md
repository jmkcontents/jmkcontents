# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JMK Contents is a web platform for promoting and managing Korean certification exam preparation iOS apps. The project is a Next.js 15 application deployed on Vercel.

- **Production URL**: https://jmkcontents.vercel.app
- **GitHub**: https://github.com/jmkcontents/jmkcontents
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Firebase, Vercel
- **Contact**: bombezzang2607@gmail.com

## Repository Structure

This is a monorepo with the Next.js application in the `jmk-contents-web` directory:

```
jmkcontents/
├── jmk-contents-web/          # Main Next.js 15 application
│   ├── app/                   # App Router (Next.js 15)
│   │   ├── apps/[bundle_id]/ # Dynamic app pages
│   │   │   ├── page.tsx      # App detail page
│   │   │   ├── concepts/     # Concepts page with filtering
│   │   │   └── lectures/     # Lectures page (future)
│   │   ├── apps/page.tsx     # App listing
│   │   └── page.tsx          # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AppCard.tsx       # App tile component
│   │   ├── ConceptCard.tsx   # Concept tile component
│   │   └── ConceptDetailModal.tsx  # Concept detail modal
│   └── lib/                   # Core libraries
│       └── firebase/         # Firebase admin setup
│           ├── admin.ts      # Firebase Admin SDK
│           ├── apps.ts       # Data fetching functions
│           └── types.ts      # TypeScript types
├── CLAUDE.md                  # This file
├── DEPLOYMENT_GUIDE.md        # Operations and deployment guide
└── JMK_CONTENTS_DEVELOPMENT_PLAN.md  # Development roadmap
```

## Common Commands

All commands should be run from the `jmk-contents-web` directory:

```bash
# Development
cd jmk-contents-web
npm run dev              # Start development server at localhost:3000

# Build and Production
npm run build            # Production build (required to test SSG)
npm start               # Start production server after build

# Code Quality
npm run lint            # Run ESLint
npm run lint -- --fix   # Auto-fix linting issues

# Deployment
# Push to main branch triggers automatic Vercel deployment
git push origin main
```

## Architecture

### Database: Firebase Firestore

The project uses **Firebase Firestore** exclusively for data storage:

- **Firebase Project**: `exam-affiliate-ads`
- **Console**: https://console.firebase.google.com/project/exam-affiliate-ads/firestore
- **Admin SDK**: Server-side only using [lib/firebase/admin.ts](jmk-contents-web/lib/firebase/admin.ts)
- **API Functions**: [lib/firebase/apps.ts](jmk-contents-web/lib/firebase/apps.ts)
- **TypeScript Types**: [lib/firebase/types.ts](jmk-contents-web/lib/firebase/types.ts)

### Database Collections

Four main Firestore collections:

- **apps**: iOS app metadata
  - Document ID: `bundle_id` (last part of iOS bundle ID, e.g., "indsafety")
  - Fields: app_name, app_name_full, description, categories, status, rating, download_count, etc.

- **concepts**: Learning concepts/study materials
  - Document ID: `{app_id}_{concept_id}` (e.g., "indsafety_1")
  - Fields: app_id, category, title, content, importance (1-5), keywords, study_note

- **lectures**: Audio lectures with transcripts
  - Document ID: Auto-generated
  - Fields: app_id, category, title, audio_url, transcript, duration

- **contact_submissions**: User contact form submissions
  - Document ID: Auto-generated
  - Fields: app_id, email, subject, message, status

See [lib/firebase/types.ts](jmk-contents-web/lib/firebase/types.ts) for complete type definitions.

### Next.js Rendering Strategy

- **SSG (Static Site Generation)**: App detail pages pre-built at build time using `generateStaticParams()`
- **ISR (Incremental Static Regeneration)**: Homepage and app listing pages revalidate every 3600 seconds (1 hour)
- **App Router**: Using Next.js 15 App Router (not Pages Router)

Example from [app/page.tsx](jmk-contents-web/app/page.tsx):
```typescript
export const revalidate = 3600 // Revalidate every hour
```

### Component Architecture

- **UI Components**: shadcn/ui components in [components/ui/](jmk-contents-web/components/ui/)
- **Layout Components**: [Header.tsx](jmk-contents-web/components/Header.tsx), [Footer.tsx](jmk-contents-web/components/Footer.tsx)
- **Reusable Components**: [AppCard.tsx](jmk-contents-web/components/AppCard.tsx) for displaying app tiles
- **Styling**: Tailwind CSS 4 with custom configuration

### API Pattern

All data fetching functions use Firebase Admin SDK in [lib/firebase/apps.ts](jmk-contents-web/lib/firebase/apps.ts):

```typescript
// Server-side data fetching with Firebase
import { getFirestoreDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/types'

export async function getApps(): Promise<App[]> {
  const db = getFirestoreDb()
  const snapshot = await db
    .collection(COLLECTIONS.APPS)
    .where('status', '==', 'published')
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    bundle_id: doc.id,
    created_at: doc.data().created_at?.toDate() || new Date(),
    updated_at: doc.data().updated_at?.toDate() || new Date(),
  })) as App[]
}
```

These functions are called directly in Server Components.

## Development Guidelines

### Adding New Apps

Apps can be added via:
1. Firebase Console (recommended): https://console.firebase.google.com/project/exam-affiliate-ads/firestore
2. Server-side scripts using Firebase Admin SDK
3. Future admin dashboard (Phase 4)

Document ID must be the bundle_id (last part of iOS bundle ID, e.g., "indsafety" from "com.eggsoft.indsafety").

### Adding New Pages

1. Create new route in `app/` directory (App Router)
2. Use Server Components by default for better performance
3. Add metadata export for SEO
4. Follow existing patterns in [app/apps/page.tsx](jmk-contents-web/app/apps/page.tsx)

Example:
```typescript
// app/new-page/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}

export default async function NewPage() {
  // Server Component - can directly await data
  const data = await fetchData()
  return <div>...</div>
}
```

### Environment Variables

Required for development and production:

```bash
# Firebase Admin SDK (Server-only)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"exam-affiliate-ads",...}'

# Contact
CONTACT_EMAIL=bombezzang2607@gmail.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=
```

**Important**:
- The `FIREBASE_SERVICE_ACCOUNT_KEY` is a JSON string containing the Firebase service account credentials
- Local development uses `.env.local`
- Production variables are set in Vercel Dashboard
- Never commit the `.env` file to Git

### TypeScript

- Strict mode enabled
- Database types are defined in [lib/firebase/types.ts](jmk-contents-web/lib/firebase/types.ts)
- Always use proper types from Firebase schema:
  ```typescript
  import { App, Concept, Lecture, COLLECTIONS } from '@/lib/firebase/types'

  // All types are interfaces matching Firestore document structure
  ```

### Testing Production Build

Always test production builds before deploying:

```bash
cd jmk-contents-web
npm run build    # Must succeed without errors
npm start        # Test the production server
```

## Deployment

### Automatic Deployment (Preferred)

Pushing to `main` branch triggers automatic Vercel deployment:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Vercel Configuration

- **Framework Preset**: Next.js
- **Root Directory**: `jmk-contents-web`
- All other settings use defaults
- Environment variables must be set in Vercel Dashboard

### Git Workflow

When committing CLAUDE.md updates, always create a commit:

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md - [describe change]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

## Current Status (2026-02-05)

### Completed (Phase 1-4)
- ✅ Next.js 15 setup with App Router
- ✅ Firebase Firestore backend (migrated from Supabase)
- ✅ Homepage, app listing, and app detail pages
- ✅ Concepts page with filtering and search
- ✅ SSG/ISR implementation
- ✅ shadcn/ui component library
- ✅ Responsive design
- ✅ Vercel production deployment
- ✅ Cloudflare DNS configuration

### In Progress (Phase 5)
- 🔄 Lectures page (/apps/[bundle_id]/lectures)
- 🔄 Image upload and Firebase Storage integration
- 🔄 Admin dashboard for content management
- 🔄 Contact form functionality
- 🔄 Google Analytics integration

## Troubleshooting

### Build Failures
1. Check Build Logs in Vercel Dashboard
2. Run `npm run build` locally to reproduce
3. Verify environment variables are set in Vercel

### Data Not Updating
- ISR revalidates every 1 hour
- For immediate updates, redeploy via `vercel --prod`
- Check Firebase Firestore rules if data access fails
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is properly set

### TypeScript Errors
- Run `npm run lint` to check for issues
- Ensure imports use proper paths with `@/` alias
- Verify database types match schema in [lib/firebase/types.ts](jmk-contents-web/lib/firebase/types.ts)

### Firebase Admin Initialization Errors
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is set
- Verify the JSON is properly formatted (no syntax errors)
- Ensure the service account has proper permissions in Firebase Console

## Additional Resources

- **Firebase Console**: https://console.firebase.google.com/project/exam-affiliate-ads/firestore
- **Firebase Data Structure Guide**: See `/Users/jongminkim/Desktop/project/35/src/exam_pipeline/docs/FIREBASE_DATA_STRUCTURE.md`
- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for operations and maintenance
- **Development Plan**: See [JMK_CONTENTS_DEVELOPMENT_PLAN.md](JMK_CONTENTS_DEVELOPMENT_PLAN.md) for roadmap
- **Vercel Dashboard**: https://vercel.com/dashboard
