import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RepositoryDetails from '../components/RepositoryDetails';

describe('RepositoryDetails Component', () => {
  const mockRepository = {
    full_name: 'facebook/react',
    description: 'A JavaScript library for building user interfaces',
    stargazers_count: 1000,
    forks_count: 500,
    watchers_count: 100,
    open_issues_count: 50,
    language: 'JavaScript',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    html_url: 'https://github.com/facebook/react',
    homepage: 'https://reactjs.org'
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('renders loading state', () => {
    render(
      <RepositoryDetails
        repository={null}
        onClose={mockOnClose}
        isLoading={true}
        error={null}
      />
    );
    
    expect(screen.getByText('Loading repository details...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    const errorMessage = 'Failed to fetch repository details';
    render(
      <RepositoryDetails
        repository={null}
        onClose={mockOnClose}
        isLoading={false}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders nothing when no repository is provided', () => {
    const { container } = render(
      <RepositoryDetails
        repository={null}
        onClose={mockOnClose}
        isLoading={false}
        error={null}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders repository details', () => {
    render(
      <RepositoryDetails
        repository={mockRepository}
        onClose={mockOnClose}
        isLoading={false}
        error={null}
      />
    );
    
    expect(screen.getByText(mockRepository.full_name)).toBeInTheDocument();
    expect(screen.getByText(mockRepository.description)).toBeInTheDocument();
    expect(screen.getByText(mockRepository.language)).toBeInTheDocument();
    
    // Check statistics
    expect(screen.getByText(mockRepository.stargazers_count.toString())).toBeInTheDocument();
    expect(screen.getByText(mockRepository.forks_count.toString())).toBeInTheDocument();
    expect(screen.getByText(mockRepository.watchers_count.toString())).toBeInTheDocument();
    expect(screen.getByText(mockRepository.open_issues_count.toString())).toBeInTheDocument();
  });

  test('handles close button click', () => {
    render(
      <RepositoryDetails
        repository={mockRepository}
        onClose={mockOnClose}
        isLoading={false}
        error={null}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders repository links', () => {
    render(
      <RepositoryDetails
        repository={mockRepository}
        onClose={mockOnClose}
        isLoading={false}
        error={null}
      />
    );
    
    const githubLink = screen.getByText('View on GitHub');
    expect(githubLink).toHaveAttribute('href', mockRepository.html_url);
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const homepageLink = screen.getByText('Visit Homepage');
    expect(homepageLink).toHaveAttribute('href', mockRepository.homepage);
    expect(homepageLink).toHaveAttribute('target', '_blank');
    expect(homepageLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('formats dates correctly', () => {
    render(
      <RepositoryDetails
        repository={mockRepository}
        onClose={mockOnClose}
        isLoading={false}
        error={null}
      />
    );
    
    const createdDate = new Date(mockRepository.created_at).toLocaleDateString();
    const updatedDate = new Date(mockRepository.updated_at).toLocaleDateString();
    
    expect(screen.getByText(new RegExp(createdDate))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(updatedDate))).toBeInTheDocument();
  });
});