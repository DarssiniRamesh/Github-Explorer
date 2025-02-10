import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>GitHub Explorer</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
