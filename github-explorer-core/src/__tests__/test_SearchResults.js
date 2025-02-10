import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchResults from '../components/SearchResults';

describe('SearchResults Component', () => {
  const mockRepositories = [
    {
      id: 1,
      full_name: 'facebook/react',
      description: 'A JavaScript library for building user interfaces',
      stargazers_count: 1000,
      forks_count: 500,
      watchers_count: 100
    },
    {
      id: 2,
      full_name: 'facebook/react-native',
      description: 'Mobile app framework',
      stargazers_count: 800,
      forks_count: 400,
      watchers_count: 80
    }
  ];

  const mockOnSelectRepository = jest.fn();

  beforeEach(() => {
    mockOnSelectRepository.mockClear();
  });

  test('renders loading state', () => {
    render(
      <SearchResults
        repositories={[]}
        onSelectRepository={mockOnSelectRepository}
        isLoading={true}
        error={null}
      />
    );
    
    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();
  });

  test('renders error state', () => {
    const errorMessage = 'Failed to fetch repositories';
    render(
      <SearchResults
        repositories={[]}
        onSelectRepository={mockOnSelectRepository}
        isLoading={false}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders empty state', () => {
    render(
      <SearchResults
        repositories={[]}
        onSelectRepository={mockOnSelectRepository}
        isLoading={false}
        error={null}
      />
    );
    
    expect(screen.getByText('No repositories found')).toBeInTheDocument();
  });

  test('renders repository list', () => {
    render(
      <SearchResults
        repositories={mockRepositories}
        onSelectRepository={mockOnSelectRepository}
        isLoading={false}
        error={null}
      />
    );
    
    mockRepositories.forEach(repo => {
      expect(screen.getByText(repo.full_name)).toBeInTheDocument();
      expect(screen.getByText(repo.description)).toBeInTheDocument();
    });
  });

  test('handles repository selection', () => {
    render(
      <SearchResults
        repositories={mockRepositories}
        onSelectRepository={mockOnSelectRepository}
        isLoading={false}
        error={null}
      />
    );
    
    const firstRepo = screen.getByText(mockRepositories[0].full_name);
    fireEvent.click(firstRepo);

    expect(mockOnSelectRepository).toHaveBeenCalledWith(mockRepositories[0]);
  });

  test('displays repository statistics', () => {
    render(
      <SearchResults
        repositories={mockRepositories}
        onSelectRepository={mockOnSelectRepository}
        isLoading={false}
        error={null}
      />
    );
    
    mockRepositories.forEach(repo => {
      expect(screen.getByText(`⭐ ${repo.stargazers_count}`)).toBeInTheDocument();
      expect(screen.getByText(`🔄 ${repo.forks_count}`)).toBeInTheDocument();
      expect(screen.getByText(`👁️ ${repo.watchers_count}`)).toBeInTheDocument();
    });
  });
});