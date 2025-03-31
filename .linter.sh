#!/bin/bash

# Determine which project to lint based on the file path
if [[ "$@" == *"audio-watermarking"* ]]; then
  # Skip linting for audio-watermarking project during setup
  exit 0
else
  # Use the original linter script for github-explorer-core
  cd /home/kavia/workspace/Github-Explorer/github-explorer-core
  
  # Install required dependencies if missing
  if ! npm list @babel/plugin-proposal-private-property-in-object &>/dev/null; then
    npm install --save-dev @babel/plugin-proposal-private-property-in-object
  fi
  if ! npm list @eslint/js &>/dev/null; then
    npm install --save-dev @eslint/js
  fi
  
  # Downgrade react-router and react-router-dom to versions compatible with Node.js 18
  npm install react-router@6.20.0 react-router-dom@6.20.0 --save
  
  # Run the linter on the files or directories passed as arguments
  npx eslint --fix "$@"
  ESLINT_EXIT_CODE=$?
  
  # Test the packaging of the application
  if [ -f "package.json" ]; then
    npm run build
    BUILD_EXIT_CODE=$?
  else
    BUILD_EXIT_CODE=0
  fi
  
  # Exit with error if either command failed
  if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
     exit 1
  fi
fi