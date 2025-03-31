import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Audio Watermarking</h1>
        <p>Embed and extract digital watermarks in audio files</p>
      </header>
      <main>
        <section>
          <h2>Features</h2>
          <ul>
            <li>Embed watermarks in audio files</li>
            <li>Extract watermarks from audio files</li>
            <li>Generate and verify cryptographic hashes</li>
            <li>Support for multiple audio formats</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
