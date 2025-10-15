# Testing Guide - SignBridge

## Overview
This document explains the testing setup and GitHub Actions CI/CD pipeline for SignBridge.

## Test Structure

### Testing Stack
- **Jest**: Test runner and assertion library
- **jest-expo**: Expo-specific Jest preset
- **@testing-library/react-native**: React Native testing utilities
- **react-test-renderer**: Component snapshot testing

### Test Files Location
```
sign-Bridge/
├── __tests__/                  # Test files
│   ├── App.test.js            # App component tests
│   ├── constants.test.js      # Constants validation
│   └── detectionService.test.js # Detection service tests
├── jest.config.js             # Jest configuration
└── jest.setup.js              # Test environment setup
```

## Running Tests Locally

### Install Dependencies
```bash
cd sign-Bridge
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- __tests__/detectionService.test.js
```

## GitHub Actions CI/CD Pipeline

### Workflow File
Location: `.github/workflows/ci.yml`

### Pipeline Stages

#### 1. **Lint & Code Quality**
- Runs ESLint on all JavaScript/TypeScript files
- Checks code formatting
- Triggers: On push and pull requests

#### 2. **Unit & Integration Tests**
- Runs Jest test suite
- Generates coverage reports
- Uploads coverage to Codecov
- Requires: Lint stage passes

#### 3. **Build Android**
- Builds Android APK using Expo
- Runs on: Push to `main` or `develop` branches
- Requires: Tests pass

#### 4. **Build iOS**
- Builds iOS app using Expo
- Runs on macOS runners
- Runs on: Push to `main` or `develop` branches
- Requires: Tests pass

#### 5. **Security Audit**
- Runs npm audit for dependency vulnerabilities
- Reports high-severity issues

#### 6. **Deploy to Expo** (Optional)
- Publishes app to Expo servers
- Runs on: Push to `main` branch only
- Requires: All builds pass

### Workflow Triggers
```yaml
on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]
  workflow_dispatch:  # Manual trigger
```

## Required GitHub Secrets

### Setup Instructions
1. Go to: `GitHub Repo → Settings → Secrets and variables → Actions`
2. Add the following secrets:

#### EXPO_TOKEN (Required for builds)
```bash
# Generate Expo token
npx expo login
npx expo whoami
npx expo token:create

# Copy token and add as GitHub secret
```

## Test Coverage Goals

### Current Coverage
- **Utils/Services**: 80%+ coverage
- **Constants**: 100% coverage
- **Components**: 60%+ coverage (UI testing)

### Coverage Reports
- Local: `sign-Bridge/coverage/lcov-report/index.html`
- CI: Uploaded to Codecov after each run

## Writing Tests

### Example: Testing a Service
```javascript
// __tests__/myService.test.js
import { myService } from '../utils/services/myService';

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should perform expected action', () => {
    const result = myService.action();
    expect(result).toBe(expected);
  });
});
```

### Example: Testing a Component
```javascript
// __tests__/MyComponent.test.js
import React from 'react';
import renderer from 'react-test-renderer';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const tree = renderer.create(<MyComponent />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
```

## Mocking Strategy

### Camera Mock (jest.setup.js)
```javascript
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));
```

### Navigation Mock
```javascript
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));
```

## Continuous Integration Best Practices

### Branch Protection Rules
Recommended settings for `main` and `develop` branches:
1. ✅ Require status checks to pass before merging
2. ✅ Require branches to be up to date before merging
3. ✅ Require pull request reviews
4. ✅ Required checks: `lint`, `test`

### Workflow Status Badge
Add to README.md:
```markdown
![CI](https://github.com/fegenau/capstone-sign-bridge/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## Troubleshooting

### Tests Fail in CI but Pass Locally
- Clear npm cache: `npm cache clean --force`
- Ensure node versions match: Local vs. CI (18.x)
- Check `package-lock.json` is committed

### Jest Timeout Errors
- Increase timeout in jest.config.js:
  ```javascript
  testTimeout: 10000
  ```

### Module Not Found Errors
- Verify `transformIgnorePatterns` in jest.config.js
- Check if module needs mocking in jest.setup.js

### Coverage Reports Missing
- Ensure `--coverage` flag is used
- Check `collectCoverageFrom` patterns in jest.config.js

## Performance Optimization

### Speed Up CI
1. Use `npm ci` instead of `npm install` (faster, more reliable)
2. Enable caching for node_modules
3. Run lint and test jobs in parallel
4. Use `continue-on-error: true` for non-critical steps

### Speed Up Local Tests
```bash
# Run only changed tests
npm test -- --onlyChanged

# Run with specific workers
npm test -- --maxWorkers=4
```

## Next Steps

### Expand Test Coverage
- [ ] Add component tests for screens
- [ ] Add integration tests for navigation
- [ ] Add E2E tests with Detox (future)
- [ ] Add visual regression tests

### Enhance CI/CD
- [ ] Add automated release notes
- [ ] Add App Store/Play Store deployment
- [ ] Add staging environment testing
- [ ] Add performance benchmarking

## Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
