# Audio Watermarking E2E Tests

This directory contains end-to-end tests for the Audio Watermarking Component using Selenium WebDriver and Mocha.

## Prerequisites

- Node.js (v18 or higher)
- Chrome browser installed
- ChromeDriver installed and in PATH
- Running instances of both the client and server applications

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure the client and server applications are running:
   - Client should be running on http://localhost:3000
   - Server should be running on http://localhost:5000

## Running Tests

Run the tests with:

```
npm test
```

## Configuration

You can configure the tests using environment variables:

- `E2E_BASE_URL`: URL of the client application (default: http://localhost:3000)
- `E2E_API_URL`: URL of the server API (default: http://localhost:5000)

Example:
```
E2E_BASE_URL=http://localhost:8080 E2E_API_URL=http://localhost:8081 npm test
```

## Test Cases

The e2e tests cover the following workflow:

1. Loading the application
2. Uploading an audio file
3. Embedding a watermark in the audio file
4. Verifying a watermarked audio file
5. Extracting watermark metadata from an audio file

## Notes

- The tests create a dummy audio file for testing purposes. In a real environment, you should use a real audio file.
- Some tests might fail in the mock setup because we're using a dummy file that doesn't contain actual audio data.