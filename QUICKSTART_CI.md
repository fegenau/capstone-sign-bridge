# 🚀 Quick Start - CI/CD & Testing

## Run Tests Locally
```bash
cd sign-Bridge
npm test                    # Run all tests
npm test -- --coverage     # With coverage report
npm test -- --watch        # Watch mode
```

## View Test Results
```
✅ 19 tests passing
📊 37% coverage on detectionService
🎯 100% coverage on constants
```

## GitHub Actions Pipeline
```
Trigger: Push to main/develop/feature/**
Stages:  Lint → Tests → Builds → Deploy

Status: Check "Actions" tab on GitHub
```

## Add GitHub Secret (Required)
```bash
# 1. Generate Expo token
npx expo login
npx expo token:create

# 2. Add to GitHub
Settings → Secrets → Actions → New secret
Name: EXPO_TOKEN
Value: [paste token]
```

## CI Workflow Files
```
.github/workflows/ci.yml       # Main CI/CD pipeline
sign-Bridge/jest.config.js     # Test configuration
sign-Bridge/__tests__/         # Test files
```

## Key Commands
```bash
npm test                       # Tests
npm run android               # Run Android
npm run ios                   # Run iOS
npm start                     # Start dev server
npx eslint .                  # Lint code
```

## Documentation
- `TESTING.md` - Full testing guide
- `CI_CD_STATUS.md` - Complete status report
- `.github/copilot-instructions.md` - AI agent guide

## Status: ✅ ALL SYSTEMS GO
