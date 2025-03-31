import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioUploader from '../components/AudioUploader';
import { useDropzone } from 'react-dropzone';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn()
}));

describe('AudioUploader Component', () => {
  const mockOnFileSelect = jest.fn();
  const mockOnError = jest.fn();
  
  // Default mock implementation for useDropzone
  const mockGetRootProps = jest.fn().mockReturnValue({
    onClick: jest.fn(),
    onKeyDown: jest.fn(),
    tabIndex: 0
  });
  
  const mockGetInputProps = jest.fn().mockReturnValue({
    accept: 'audio/*',
    multiple: false
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useDropzone as jest.Mock).mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: false
    });
  });

  it('renders the component correctly', () => {
    render(<AudioUploader onFileSelect={mockOnFileSelect} onError={mockOnError} />);
    
    // Check if the component renders the correct text
    expect(screen.getByText('Drag & drop an audio file here, or click to select')).toBeInTheDocument();
    expect(screen.getByText('Supported formats: MP3, WAV, OGG, M4A')).toBeInTheDocument();
  });

  it('displays drag active message when dragging', () => {
    // Mock isDragActive to be true
    (useDropzone as jest.Mock).mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: true
    });
    
    render(<AudioUploader onFileSelect={mockOnFileSelect} onError={mockOnError} />);
    
    // Check if the component renders the drag active message
    expect(screen.getByText('Drop the audio file here...')).toBeInTheDocument();
  });

  it('calls onFileSelect with valid audio file', () => {
    // Create a mock implementation for useDropzone that calls onDrop
    (useDropzone as jest.Mock).mockImplementation(({ onDrop }) => {
      // Create a mock file
      const mockFile = new File(['audio content'], 'test-audio.mp3', { type: 'audio/mp3' });
      
      // Call onDrop with the mock file
      setTimeout(() => onDrop([mockFile]), 0);
      
      return {
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false
      };
    });
    
    render(<AudioUploader onFileSelect={mockOnFileSelect} onError={mockOnError} />);
    
    // Wait for the onDrop to be called
    setTimeout(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith({
        file: expect.any(File),
        name: 'test-audio.mp3',
        type: 'audio/mp3'
      });
      expect(mockOnError).not.toHaveBeenCalled();
    }, 10);
  });

  it('calls onError with invalid file type', () => {
    // Create a mock implementation for useDropzone that calls onDrop with an invalid file
    (useDropzone as jest.Mock).mockImplementation(({ onDrop }) => {
      // Create a mock file with invalid type
      const mockFile = new File(['image content'], 'test-image.png', { type: 'image/png' });
      
      // Call onDrop with the mock file
      setTimeout(() => onDrop([mockFile]), 0);
      
      return {
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false
      };
    });
    
    render(<AudioUploader onFileSelect={mockOnFileSelect} onError={mockOnError} />);
    
    // Wait for the onDrop to be called
    setTimeout(() => {
      expect(mockOnError).toHaveBeenCalledWith('Please select a valid audio file');
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    }, 10);
  });

  it('configures dropzone with correct options', () => {
    render(<AudioUploader onFileSelect={mockOnFileSelect} onError={mockOnError} />);
    
    // Check if useDropzone was called with the correct options
    expect(useDropzone).toHaveBeenCalledWith({
      onDrop: expect.any(Function),
      accept: {
        'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
      },
      multiple: false
    });
  });

  it('applies active class when dragging', () => {
    // Mock isDragActive to be true
    (useDropzone as jest.Mock).mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: true
    });
    
    const { container } = render(<AudioUploader onFileSelect={mockOnFileSelect} onError={mockOnError} />);
    
    // Check if the active class is applied
    const dropzoneElement = container.querySelector('.dropzone');
    expect(dropzoneElement).toHaveClass('active');
  });
});