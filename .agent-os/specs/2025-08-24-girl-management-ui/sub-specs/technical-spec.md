# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-24-girl-management-ui/spec.md

## Technical Requirements

### 1. Database Schema Requirements

#### New Girls Table Structure
```sql
CREATE TABLE girls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age > 0 AND age < 150),
  nationality VARCHAR(100),
  rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 10.0),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_girls_user_id ON girls(user_id);
CREATE INDEX idx_girls_team_id ON girls(team_id);
CREATE INDEX idx_girls_status ON girls(status);
```

#### Drizzle Schema Definition
```typescript
// Addition to lib/db/schema.ts
export const girls = pgTable('girls', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  age: integer('age'),
  nationality: varchar('nationality', { length: 100 }),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_girls_user_id').on(table.userId),
  teamIdIdx: index('idx_girls_team_id').on(table.teamId),
  statusIdx: index('idx_girls_status').on(table.status),
  ageCheck: check('girls_age_check', sql`${table.age} > 0 AND ${table.age} < 150`),
  ratingCheck: check('girls_rating_check', sql`${table.rating} >= 1.0 AND ${table.rating} <= 10.0`),
}));

// Type definitions
export type Girl = typeof girls.$inferSelect;
export type NewGirl = typeof girls.$inferInsert;
```

#### Activity Log Integration
Add new activity types to existing `ActivityType` enum:
```typescript
export enum ActivityType {
  // ... existing types
  CREATE_GIRL = 'CREATE_GIRL',
  UPDATE_GIRL = 'UPDATE_GIRL',
  DELETE_GIRL = 'DELETE_GIRL',
}
```

### 2. Component Architecture

#### Page Component Structure
```
app/
├── (dashboard)/
│   └── girls/
│       ├── page.tsx              # Main girls page
│       └── page-client.tsx       # Client-side logic
└── components/
    └── girls/
        ├── girls-card.tsx        # Individual girl card
        ├── girls-grid.tsx        # Card grid container  
        ├── create-girl-modal.tsx # Create modal
        ├── edit-girl-modal.tsx   # Edit modal
        └── empty-state.tsx       # No girls state
```

#### Component Specifications

**GirlsPage (Server Component)**
- File: `app/(dashboard)/girls/page.tsx`
- Responsibilities: Data fetching, authentication verification
- Server Actions integration for CRUD operations

**GirlsPageClient (Client Component)**
- File: `app/(dashboard)/girls/page-client.tsx`
- Responsibilities: State management, modal handling, UI interactions
- Props: `initialGirls: Girl[]`

**GirlCard Component**
```typescript
interface GirlCardProps {
  girl: Girl;
  onEdit: (girl: Girl) => void;
  onDelete: (id: number) => void;
  onManageData: (girl: Girl) => void;
}
```
- Status badge color mapping:
  - `active`: `bg-green-100 text-green-800`
  - `inactive`: `bg-gray-100 text-gray-800`
  - `blocked`: `bg-red-100 text-red-800`

**CreateGirlModal Component**
```typescript
interface CreateGirlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (girl: Girl) => void;
}
```

### 3. State Management Approach

#### Client-Side State (React State)
```typescript
// page-client.tsx state structure
interface GirlsPageState {
  girls: Girl[];
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedGirl: Girl | null;
  isLoading: boolean;
  error: string | null;
}
```

#### Server Actions
```typescript
// app/(dashboard)/girls/actions.ts
export async function createGirl(formData: FormData): Promise<ActionResult<Girl>>
export async function updateGirl(id: number, formData: FormData): Promise<ActionResult<Girl>>
export async function deleteGirl(id: number): Promise<ActionResult<void>>
export async function getGirls(): Promise<Girl[]>
```

#### Optimistic Updates Pattern
- Create: Add girl to local state immediately, rollback on error
- Update: Update local state immediately, rollback on error  
- Delete: Remove from local state immediately, rollback on error

### 4. Navigation System Integration

#### Sidebar Component Updates
- File: `components/navigation/navigation-sidebar.tsx` (to be created)
- Replace "Profiles" with "Girls" menu item
- Icon: `Users` from lucide-react (blue accent when active)
- Route: `/girls`
- Active state detection via `usePathname() === '/girls'`

#### Navigation Menu Structure
```typescript
const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Girls', href: '/girls', icon: Users }, // Updated from "Profiles"
  { label: 'Overview', href: '/overview', icon: BarChart3 },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Subscription', href: '/subscription', icon: CreditCard },
  { label: 'New Entry', href: '/add-girl', icon: Plus }
];
```

#### Layout Integration
- Update `app/(dashboard)/layout.tsx` to include sidebar
- Responsive sidebar: hidden on mobile (`hidden md:flex`)
- Desktop layout: `w-64` sidebar + flex-1 main content

### 5. UI/UX Specifications

#### Design System Compliance
- **Colors**: Use CPN color system (`cpn-dark`, `cpn-white`, `cpn-yellow`, `cpn-gray`)
- **Blue Accents**: Use `blue-500`/`blue-600` for CTAs and active states
- **Typography**: Tailwind default font stack
- **Spacing**: Tailwind spacing scale (4, 6, 8, 12, 16, 24, 32)

#### Responsive Grid Layout
```css
/* Grid container classes */
.girls-grid {
  @apply grid gap-6;
  @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
  @apply p-6;
}
```

#### Mobile-First Breakpoints
- `sm: 640px`: 2 columns
- `lg: 1024px`: 3 columns  
- `xl: 1280px`: 4 columns

#### Card Component Styling
```typescript
// Base card classes
const cardClasses = cn(
  "bg-cpn-dark border border-cpn-gray/20 rounded-lg p-6",
  "hover:border-cpn-yellow/50 transition-colors duration-200",
  "shadow-sm hover:shadow-md"
);
```

#### Modal Styling
- Backdrop: `bg-black/50`
- Modal container: `bg-cpn-dark border border-cpn-gray/20 rounded-lg`
- Max width: `max-w-md`
- Center positioning with backdrop blur

### 6. Form Validation Requirements

#### Zod Schema Definition
```typescript
// lib/validations/girl.ts
import { z } from 'zod';

export const createGirlSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  age: z.number()
    .min(18, "Age must be at least 18")
    .max(100, "Age must be less than 100")
    .optional(),
  nationality: z.string().max(100, "Nationality too long").optional(),
  rating: z.number()
    .min(1, "Rating must be at least 1")
    .max(10, "Rating must be at most 10")
    .optional(),
  status: z.enum(['active', 'inactive', 'blocked']).default('active')
});

export type CreateGirlInput = z.infer<typeof createGirlSchema>;
```

#### Form Error Handling
- Field-level validation on blur
- Form-level validation on submit
- Server-side validation with error return
- Toast notifications for success/error states

#### Nationality Input Component
- Initially text input for MVP
- Future enhancement: searchable dropdown with country list
- Validation: optional field, max 100 characters

### 7. Performance Considerations

#### Card Grid Rendering Optimizations
- **Virtualization**: Not required for MVP (typical datasets < 100 items)
- **Lazy Loading**: Implement if user has >50 girls
- **Image Optimization**: Not applicable (no photos in MVP)
- **Memoization**: Wrap GirlCard in `React.memo` for prop stability

#### Database Query Optimization  
```sql
-- Optimized query with indexes
SELECT * FROM girls 
WHERE user_id = ? AND team_id = ?
ORDER BY created_at DESC
LIMIT 100;
```

#### Bundle Size Considerations
- Use existing shadcn/ui components (no new dependencies)
- Lazy load modal components with `React.lazy`
- Tree-shake unused Lucide React icons

#### Caching Strategy
- Server-side: Cache girls data at route level
- Client-side: React Query or SWR for data synchronization (future enhancement)
- Database: Utilize existing connection pooling

### 8. Integration Points

#### Authentication Integration
- Use existing `useAuth()` hook for user context
- Server actions require authenticated user session
- Team-scoped data access (user must be team member)

#### Existing Form Components Reuse
- `FormField` component from `components/forms/form-field.tsx`
- `Button` component with CPN styling
- `Input` component with validation states

#### Activity Logging Integration
```typescript
// Activity logging in server actions
await logActivity({
  teamId: user.teamId,
  userId: user.id,
  action: ActivityType.CREATE_GIRL,
  ipAddress: getClientIP(request)
});
```

#### Error Boundary Integration
- Use existing `ErrorBoundary` component
- Graceful error states for failed operations
- Fallback UI for network errors

### 9. Testing Requirements

#### Unit Test Coverage
- GirlCard component rendering
- Form validation logic
- Server actions functionality
- Modal open/close behavior

#### Integration Test Scenarios
- Complete girl creation flow
- Edit and delete operations
- Empty state display
- Responsive layout behavior

#### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance

### 10. Migration and Data Consistency

#### Database Migration Script
```sql
-- Migration: 001_create_girls_table.sql
CREATE TABLE girls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age > 0 AND age < 150),
  nationality VARCHAR(100),
  rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 10.0),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_girls_user_id ON girls(user_id);
CREATE INDEX idx_girls_team_id ON girls(team_id);
CREATE INDEX idx_girls_status ON girls(status);
```

#### Data Seeding (Development)
```typescript
// Optional: Seed script for development
export async function seedGirls() {
  const sampleGirls = [
    { name: "Emma", age: 25, nationality: "French", rating: 8.5, status: "active" },
    { name: "Sofia", age: 23, nationality: "Spanish", rating: 9.0, status: "active" }
  ];
  // ... seeding logic
}
```

### 11. Security Considerations

#### Input Sanitization
- Server-side validation on all inputs
- SQL injection prevention via Drizzle ORM parameterized queries
- XSS prevention via React's built-in escaping

#### Authorization Checks
```typescript
// Ensure user can only access their team's girls
async function getUserGirls(userId: number, teamId: number) {
  // Verify user belongs to team
  const membership = await getTeamMembership(userId, teamId);
  if (!membership) throw new Error("Unauthorized");
  
  return await db.select().from(girls)
    .where(and(eq(girls.userId, userId), eq(girls.teamId, teamId)));
}
```

#### Rate Limiting
- Implement on create/update operations
- Use existing middleware patterns
- Prevent abuse of CRUD operations

This technical specification provides comprehensive coverage of all implementation requirements while leveraging the existing Next.js 15, TypeScript, Tailwind CSS, and Drizzle ORM technology stack. No new external dependencies are required beyond what's already established in the codebase.