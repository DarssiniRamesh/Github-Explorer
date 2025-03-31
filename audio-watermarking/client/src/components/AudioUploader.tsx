import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface AudioFile {
  file: File;
  name: string;
  type: string;
}

interface AudioUploaderProps {
  onFileSelect: (file: AudioFile) => void;
  onError: (error: string) => void;
}

// PUBLIC_INTERFACE
const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelect, onError }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type.startsWith('audio/')) {
        onFileSelect({
          file,
          name: file.name,
          type: file.type
        });
      } else {
        onError('Please select a valid audio file');
      }
    },
    [onFileSelect, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    multiple: false
  });

  return (
    <div className="audio-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the audio file here...</p>
        ) : (
          <p>Drag & drop an audio file here, or click to select</p>
        )}
      </div>
      <div className="supported-formats">
        <p>Supported formats: MP3, WAV, OGG, M4A</p>
      </div>
    </div>
  );
};

export default AudioUploader;
