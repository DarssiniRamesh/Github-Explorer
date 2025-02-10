import React from 'react';
import { Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>GitHub Explorer</h1>
      </header>
      <main>
        <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
