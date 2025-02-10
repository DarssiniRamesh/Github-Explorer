import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepositorySidebar from '../components/RepositorySidebar';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.disconnect = jest.fn();
  }
}

beforeAll(() => {
  window.IntersectionObserver = MockIntersectionObserver;
});

describe('RepositorySidebar', () => {
  const mockHeaderOffset = 60;
  
  beforeEach(() => {
    // Reset window width to desktop size
    global.innerWidth = 1024;
    
    // Mock DOM elements and methods
    document.body.innerHTML = `
      <header style="height: ${mockHeaderOffset}px"></header>
      <div id="overview"></div>
      <div id="readme"></div>
      <div id="commit-history"></div>
      <div id="contributors"></div>
    `;
    
    window.scrollTo = jest.fn();
    
    // Reset IntersectionObserver mock for each test
    window.IntersectionObserver = jest.fn((callback) => ({
      observe: jest.fn(),
      disconnect: jest.fn()
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders all section links', () => {
    render(<RepositorySidebar />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('README')).toBeInTheDocument();
    expect(screen.getByText('Commit History')).toBeInTheDocument();
    expect(screen.getByText('Contributors')).toBeInTheDocument();
  });

  test('applies active class to current section', () => {
    render(<RepositorySidebar />);
    const overviewButton = screen.getByText('Overview');
    
    fireEvent.click(overviewButton);
    
    expect(overviewButton.closest('button')).toHaveClass('active');
  });

  test('handles mobile menu toggle', () => {
    render(<RepositorySidebar />);
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    const nav = document.querySelector('.repository-sidebar');
    
    fireEvent.click(toggleButton);
    expect(nav).toHaveClass('active');
    
    fireEvent.click(toggleButton);
    expect(nav).not.toHaveClass('active');
  });

  test('closes mobile menu when clicking overlay', () => {
    render(<RepositorySidebar />);
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    const overlay = document.querySelector('.sidebar-overlay');
    
    fireEvent.click(toggleButton);
    expect(overlay).toHaveClass('active');
    
    fireEvent.click(overlay);
    expect(overlay).not.toHaveClass('active');
  });

  test('closes mobile menu on window resize above 768px', () => {
    render(<RepositorySidebar />);
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    
    // Open mobile menu
    fireEvent.click(toggleButton);
    expect(document.querySelector('.repository-sidebar')).toHaveClass('active');
    
    // Trigger resize event
    act(() => {
      global.innerWidth = 1024;
      fireEvent(window, new Event('resize'));
    });
    
    expect(document.querySelector('.repository-sidebar')).not.toHaveClass('active');
  });

  test('scrolls to section with header offset', () => {
    render(<RepositorySidebar />);
    const readmeButton = screen.getByText('README');
    
    // Mock getBoundingClientRect
    const mockRect = { top: 100 };
    Element.prototype.getBoundingClientRect = jest.fn(() => mockRect);
    
    fireEvent.click(readmeButton);
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth'
    });
  });

  test('cleans up observers and event listeners on unmount', () => {
    let observerInstance;
    window.IntersectionObserver = jest.fn((callback) => {
      observerInstance = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
      return observerInstance;
    });

    const { unmount } = render(<RepositorySidebar />);
    unmount();
    
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });

  test('accepts and applies custom className', () => {
    const customClass = 'custom-sidebar';
    render(<RepositorySidebar className={customClass} />);
    
    expect(document.querySelector('.repository-sidebar')).toHaveClass(customClass);
  });

  test('handles section highlighting via IntersectionObserver', () => {
    let observerCallback;
    window.IntersectionObserver = jest.fn((callback) => {
      observerCallback = callback;
      return {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
    });
    
    render(<RepositorySidebar />);
    
    // Simulate intersection
    act(() => {
      observerCallback([
        {
          target: { id: 'readme' },
          isIntersecting: true
        }
      ]);
    });
    
    expect(screen.getByText('README').closest('button')).toHaveClass('active');
  });
});
