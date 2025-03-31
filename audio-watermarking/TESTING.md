# Audio Watermarking Component Testing Guide

This document provides an overview of the testing setup for the Audio Watermarking Component.

## Testing Frameworks

The project uses the following testing frameworks:

- **Jest**: For unit testing both backend and frontend components
- **Mocha**: For integration testing of backend services
- **Selenium**: For end-to-end testing of the complete watermarking workflow

## Test Structure

### Backend Tests

Backend tests are located in the `server/src/__tests__` directory and include:

- **Unit tests** for services and utilities
- **Integration tests** for API endpoints

### Frontend Tests

Frontend tests are located in the `client/src/__tests__` directory and include:

- **Unit tests** for React components
- **Integration tests** for hooks and services

### End-to-End Tests

End-to-end tests are located in the `e2e` directory and include:

- **Workflow tests** that simulate user interactions with the application

## Running Tests

### Running All Tests

To run all tests across the project:

```bash
npm test
```

### Running Unit Tests Only

To run only the unit tests for both server and client:

```bash
npm run test:unit
```

### Running End-to-End Tests

To run only the end-to-end tests:

```bash
npm run test:e2e
```

### Running Tests for Specific Components

#### Server Tests

```bash
cd server
npm test
```

#### Client Tests

```bash
cd client
npm test
```

#### Running Tests in Watch Mode (Client)

```bash
cd client
npm run test:watch
```

## Test Coverage

Test coverage reports are generated automatically when running tests. You can view the coverage reports in the following locations:

- Server: `server/coverage/lcov-report/index.html`
- Client: `client/coverage/lcov-report/index.html`

## Writing Tests

### Backend Tests

Backend tests use Jest and should follow these guidelines:

1. Place test files in the `server/src/__tests__` directory
2. Name test files with the pattern `*.test.ts`
3. Use mocks for external dependencies
4. Test both success and error cases

Example:

```typescript
import { SomeService } from '../services/some.service';

describe('SomeService', () => {
  let service: SomeService;
  
  beforeEach(() => {
    service = new SomeService();
  });
  
  it('should do something', () => {
    // Test implementation
  });
});
```

### Frontend Tests

Frontend tests use Jest with React Testing Library and should follow these guidelines:

1. Place test files in the `client/src/__tests__` directory
2. Name test files with the pattern `*.test.tsx`
3. Test component rendering, user interactions, and state changes
4. Mock API calls and external dependencies

Example:

```typescript
import { render, screen } from '@testing-library/react';
import SomeComponent from '../components/SomeComponent';

describe('SomeComponent', () => {
  it('renders correctly', () => {
    render(<SomeComponent />);
    expect(screen.getByText('Some Text')).toBeInTheDocument();
  });
});
```

### End-to-End Tests

End-to-end tests use Selenium with Mocha and should follow these guidelines:

1. Place test files in the `e2e` directory
2. Name test files with the pattern `*.test.js`
3. Test complete user workflows
4. Use explicit waits for asynchronous operations

Example:

```javascript
const { Builder, By, until } = require('selenium-webdriver');

describe('Some Workflow', function() {
  let driver;
  
  before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
  });
  
  after(async function() {
    await driver.quit();
  });
  
  it('should complete the workflow', async function() {
    await driver.get('http://localhost:3000');
    // Test implementation
  });
});
```

## Mocking

### Mocking External Services

For backend tests, use Jest's mocking capabilities to mock external services:

```typescript
jest.mock('../utils/some.util', () => {
  return {
    SomeUtil: {
      someMethod: jest.fn().mockReturnValue('mocked value')
    }
  };
});
```

### Mocking API Calls

For frontend tests, use Jest's mocking capabilities to mock API calls:

```typescript
jest.mock('../services/api.service', () => {
  return {
    someApiCall: jest.fn().mockResolvedValue({ data: 'mocked data' })
  };
});
```

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline using GitHub Actions. The workflow is defined in `.github/workflows/ci.yml`.

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests
2. **Descriptive Test Names**: Use descriptive names for test cases that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests using the AAA pattern
4. **Test Edge Cases**: Include tests for edge cases and error conditions
5. **Keep Tests Fast**: Optimize tests to run quickly to enable rapid feedback
6. **Avoid Test Duplication**: Use test helpers and fixtures to avoid duplicating code
7. **Test Real Behavior**: Focus on testing behavior rather than implementation details