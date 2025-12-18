# ATK Project File Structure

This document explains which files can be edited and which are auto-generated in an ATK declarative agent project.

## ⚠️ CRITICAL RULE FOR CODING AGENTS

**NEVER edit files in these locations:**
- `appPackage/manifest.json` - **AUTO-GENERATED**
- `appPackage/declarativeAgent.json` - **AUTO-GENERATED**
- `.generated/` folder - **ALL FILES AUTO-GENERATED**

These files are regenerated from source definitions on every build. Manual edits will be **overwritten and lost**.

## Project Structure

```
my-agent/
├── appPackage/
│   ├── manifest.json           ❌ DO NOT EDIT (auto-generated)
│   ├── declarativeAgent.json   ❌ DO NOT EDIT (auto-generated)
│   ├── color.png              ✅ EDIT THIS (app icon - color)
│   └── outline.png            ✅ EDIT THIS (app icon - outline)
├── .generated/                 ❌ DO NOT EDIT (all files auto-generated)
│   └── ...
├── src/                        ✅ EDIT THIS (TypeSpec source files)
│   └── *.tsp                   ✅ EDIT THIS (agent instructions, capabilities)
├── .env.dev                    ✅ EDIT THIS (dev environment variables)
├── .env.local                  ✅ EDIT THIS (local environment variables)
├── m365agents.yml              ✅ EDIT THIS (build configuration)
├── package.json                ✅ EDIT THIS (npm dependencies)
└── README.md                   ✅ EDIT THIS (project documentation)
```

## Files You CAN Edit

### TypeSpec Source Files (TypeSpec Format)
- **`src/*.tsp`** - Type-safe agent and API definitions
  - Agent name, description, and instructions
  - Agent behavior and capabilities
  - Conversation starters
  - Knowledge sources
  - API endpoint definitions
  - Request/response schemas
  - These compile to generated output (declarativeAgent.json, manifest.json)

### Source Configuration Files (JSON Format)
- **Source files in project root** - Define agent behavior
  - These are compiled to generate declarativeAgent.json
  - Check project documentation for specific source file locations

### Visual Assets
- **`appPackage/color.png`** - App icon (192x192, full color)
- **`appPackage/outline.png`** - App icon (32x32, monochrome outline)

### Environment Configuration
- **`.env.dev`** - Development environment variables
- **`.env.local`** - Local development variables
- **`.env.staging`** - Staging environment variables
- **`.env.prod`** - Production environment variables
- **Never commit these to version control**

### Build Configuration
- **`m365agents.yml`** - Project lifecycle configuration
  - Provisioning steps
  - Deployment configuration
  - Build pipeline settings

### Project Metadata
- **`package.json`** - npm dependencies and scripts
- **`README.md`** - Project documentation

## Files You MUST NOT Edit

### Auto-Generated Manifest
- **`appPackage/manifest.json`**
  - Generated from source definitions
  - Contains app ID, version, capabilities
  - Regenerated on every build
  - **DO NOT manually edit**

### Auto-Generated Agent Configuration
- **`appPackage/declarativeAgent.json`**
  - Generated from TypeSpec source files or source configuration
  - Contains agent instructions, conversation starters, capabilities
  - Regenerated on every build
  - **DO NOT manually edit**

### Generated Code
- **`.generated/`** folder
  - All TypeScript/JavaScript output from TypeSpec
  - Generated schemas and types
  - Build artifacts
  - **DO NOT manually edit any files in this folder**

## Build Process

The build process works like this:

```
Source Files              Build Process           Generated Files
─────────────            ──────────────          ────────────────
src/*.tsp           →    TypeSpec Compiler  →    .generated/**
                    →    Agent Builder      →    declarativeAgent.json
                    →    Manifest Builder   →    manifest.json
```

**Key Points:**
1. Edit source files (TypeSpec *.tsp files in src/)
2. Run build command (`npm run build`)
3. Generated files (manifest.json, declarativeAgent.json, .generated/*) are created/updated automatically
4. Never edit generated files directly

## Common Mistakes

### ❌ WRONG: Editing declarativeAgent.json directly
```json
// DON'T DO THIS in appPackage/declarativeAgent.json
{
  "name": "My Agent",  // ❌ Will be overwritten
  "instructions": "New instructions"  // ❌ Will be lost on build
}
```

### ✅ CORRECT: Edit TypeSpec source
```typescript
// DO THIS in src/main.tsp
model Agent {
  name: "My Agent";  // ✅ Source of truth
  instructions: "New instructions";  // ✅ Persists through builds
}
```

### ❌ WRONG: Editing manifest.json directly
```json
// DON'T DO THIS in appPackage/manifest.json
{
  "name": { "short": "My Agent" }  // ❌ Will be overwritten
}
```

### ✅ CORRECT: Edit TypeSpec source
```typescript
// DO THIS in src/main.tsp - manifest is generated from this
```

### ❌ WRONG: Editing generated code
```typescript
// DON'T DO THIS in .generated/types.ts
export interface MyType {  // ❌ Will be overwritten
  newField: string;
}
```

### ✅ CORRECT: Edit TypeSpec source
```typescript
// DO THIS in src/main.tsp
model MyType {  // ✅ Source of truth
  newField: string;
}
```

## Why This Matters

**Problem:** Coding agent edits `declarativeAgent.json` or `manifest.json` directly
```
1. Agent edits appPackage/declarativeAgent.json or appPackage/manifest.json
2. Developer runs build command
3. Both files are regenerated from TypeSpec source
4. Agent's changes are lost
5. Build may fail due to conflicts
```

**Solution:** Edit TypeSpec source files only
```
1. Agent edits src/*.tsp files
2. Developer runs build command
3. Changes compile to declarativeAgent.json and manifest.json correctly
4. Build succeeds
5. Changes persist
```

## Build Commands

To regenerate files after editing sources:

```bash
# Install dependencies
npm install

# Build project (regenerates manifest.json and .generated/)
npm run build

# Validate project
atk validate

# Preview locally
atk preview --env local
```

## Verification

To check which files are generated, look for these indicators:

1. **File location**: Is it in `.generated/` folder? → Don't edit
2. **File name**: Is it `manifest.json`? → Don't edit
3. **File header**: Does it have "Auto-generated" comment? → Don't edit
4. **TypeSpec output**: Was it compiled from `.tsp` files? → Don't edit

## Summary

### ✅ Always Edit (Source Files)
- `src/*.tsp` (TypeSpec sources - agent instructions, capabilities, definitions)
- `.env.*` files
- `appPackage/*.png` (icons)
- `m365agents.yml`
- `package.json`
- `README.md`

### ❌ Never Edit (Generated Files)
- `appPackage/manifest.json` - **AUTO-GENERATED**
- `appPackage/declarativeAgent.json` - **AUTO-GENERATED**
- `.generated/**/*` - **ALL AUTO-GENERATED**
- Any file marked "Auto-generated"

### 🔄 Workflow
1. Edit source files
2. Run `npm run build`
3. Generated files updated automatically
4. Test and deploy

**Remember:** The build system manages file generation. Your job is to edit source files and let the build system handle the rest.
