import React, { useState } from 'react';
import './App.css';
import AudioUploader from './components/AudioUploader';
import WatermarkForm, { WatermarkData } from './components/WatermarkForm';
import AudioPlayer from './components/AudioPlayer';
import WatermarkVerifier from './components/WatermarkVerifier';
import axios from 'axios';

interface AudioFile {
  file: File;
  name: string;
  type: string;
}

interface AppState {
  selectedFile: AudioFile | null;
  isProcessing: boolean;
  error: string | null;
  watermarkedAudioUrl: string | null;
  verificationResult: {
    success: boolean;
    watermark?: string;
    error?: string;
  } | null;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    selectedFile: null,
    isProcessing: false,
    error: null,
    watermarkedAudioUrl: null,
    verificationResult: null
  });

  const handleFileSelect = (audioFile: AudioFile) => {
    setState({
      ...state,
      selectedFile: audioFile,
      error: null,
      watermarkedAudioUrl: null,
      verificationResult: null
    });
  };

  const handleError = (error: string) => {
    setState({
      ...state,
      error,
      watermarkedAudioUrl: null,
      verificationResult: null
    });
  };

  const handleWatermarkSubmit = async (watermarkData: WatermarkData) => {
    if (!state.selectedFile) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    const formData = new FormData();
    formData.append('audio', state.selectedFile.file);
    formData.append('watermarkText', watermarkData.text);
    formData.append('strength', watermarkData.strength.toString());

    try {
      const response = await axios.post('/api/watermark/embed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      const audioUrl = URL.createObjectURL(response.data);
      setState(prev => ({
        ...prev,
        watermarkedAudioUrl: audioUrl,
        isProcessing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to embed watermark',
        isProcessing: false
      }));
    }
  };

  const handleVerificationComplete = (result: {
    success: boolean;
    watermark?: string;
    error?: string;
  }) => {
    setState(prev => ({
      ...prev,
      verificationResult: result
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Audio Watermarking</h1>
        <p>Embed and extract digital watermarks in audio files</p>
      </header>
      <main>
        <section className="upload-section">
          <h2>Upload Audio File</h2>
          <AudioUploader
            onFileSelect={handleFileSelect}
            onError={handleError}
          />
          {state.error && (
            <p className="error-message">{state.error}</p>
          )}
        </section>

        {state.selectedFile && (
          <section className="watermark-section">
            <h2>Watermark Settings</h2>
            <WatermarkForm
              onSubmit={handleWatermarkSubmit}
              isProcessing={state.isProcessing}
            />
          </section>
        )}

        {state.watermarkedAudioUrl && (
          <section className="preview-section">
            <h2>Watermarked Audio Preview</h2>
            <AudioPlayer
              audioUrl={state.watermarkedAudioUrl}
              fileName={state.selectedFile?.name || 'watermarked-audio'}
            />
          </section>
        )}

        {state.watermarkedAudioUrl && state.selectedFile && (
          <section className="verify-section">
            <WatermarkVerifier
              audioFile={state.selectedFile.file}
              onVerificationComplete={handleVerificationComplete}
            />
            {state.verificationResult && (
              <div className="verification-result">
                {state.verificationResult.success ? (
                  <p className="success">
                    Watermark found: {state.verificationResult.watermark}
                  </p>
                ) : (
                  <p className="error">
                    {state.verificationResult.error || 'Verification failed'}
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
