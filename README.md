# Config Server Monorepo

NPM workspace-based monorepo for a full-stack application.

## Structure

```
config-server/
├── backend/          # NestJS backend (create with Nest CLI)
├── frontend/         # Vue 3 frontend (create with Vue CLI)
├── shared/           # Shared TypeScript types and models
├── scripts/          # Build and utility scripts
└── package.json      # Root package.json with workspace config
```

## Getting Started

### Initial Setup

1. Install dependencies:
   ```bash
   npm install
   ```
   This will automatically create symlinks for the shared folder.

### Creating Backend (NestJS)

```bash
cd backend
npx @nestjs/cli new . --skip-install
```

Add to `backend/package.json` dependencies:

```json
"@config-server/shared": "*"
```

### Creating Frontend (Vue 3)

```bash
cd frontend
npm create vue@latest . -- --typescript
```

Add to `frontend/package.json` dependencies:

```json
"@config-server/shared": "*"
```

### After Creating Projects

Run `npm install` at the root again to link everything properly.

## Using Shared Code

The `shared/src` folder is symlinked into:

- `backend/src/shared/`
- `frontend/src/shared/`

Import shared types/models like this:

```typescript
import { YourType } from "./shared/types/your-type";
import { yourModel } from "./shared/models/your-model";
```

## Scripts

- `npm run dev:backend` - Start backend dev server
- `npm run dev:frontend` - Start frontend dev server
- `npm version patch` - Bump patch version across all packages
- `npm version minor` - Bump minor version across all packages
- `npm version major` - Bump major version across all packages
- `npm version patch -m "Custom message %s"` - Version with custom commit message

## Version Management

The version script updates all package.json files to keep versions synchronized across the monorepo and creates a git tag.

After versioning:

```bash
git push && git push --tags
```

## Development Workflow

1. Add shared types/models to `shared/src/`
2. Export them from `shared/src/index.ts`
3. Use them in backend/frontend via the symlinked `./shared/` path
4. Code gets compiled with the respective project's TypeScript config
