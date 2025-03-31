import React, { useState } from 'react';
import './App.css';

// TypeScript interfaces for component props and state
interface AudioFile {
  file: File;
  name: string;
  type: string;
}

interface AppState {
  selectedFile: AudioFile | null;
  isProcessing: boolean;
  error: string | null;
}

const App: React.FC = () => {
  // State management with TypeScript types
  const [state, setState] = useState<AppState>({
    selectedFile: null,
    isProcessing: false,
    error: null
  });

  // File selection handler with type safety
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setState({
        ...state,
        selectedFile: {
          file,
          name: file.name,
          type: file.type
        },
        error: null
      });
    } else {
      setState({
        ...state,
        error: 'Please select a valid audio file'
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Audio Watermarking</h1>
        <p>Embed and extract digital watermarks in audio files</p>
      </header>
      <main>
        <section className="file-upload-section">
          <h2>Upload Audio File</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          {state.error && (
            <p className="error-message">{state.error}</p>
          )}
          {state.selectedFile && (
            <div className="file-info">
              <p>Selected file: {state.selectedFile.name}</p>
              <p>Type: {state.selectedFile.type}</p>
            </div>
          )}
        </section>
        <section className="features-section">
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
};

export default App;
