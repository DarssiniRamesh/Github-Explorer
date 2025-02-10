import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

// Mock console.error to prevent test output pollution
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Test component that throws an error
const ErrorThrowingComponent = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal rendering</div>;
};

// Test component for custom fallback UI
const CustomFallback = () => <div>Custom error message</div>;

describe('ErrorBoundary', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal rendering')).toBeInTheDocument();
  });

  test('renders error UI when child component throws', () => {
    const { container } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(container.querySelector('.error-boundary')).toBeInTheDocument();
    expect(container.querySelector('details')).toBeInTheDocument();
  });

  test('renders custom fallback UI when provided', () => {
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  test('captures and displays error information', () => {
    const { container } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('details')).toHaveTextContent('Test error');
    expect(console.error).toHaveBeenCalled();
  });

  test('handles multiple errors independently', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal rendering')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});