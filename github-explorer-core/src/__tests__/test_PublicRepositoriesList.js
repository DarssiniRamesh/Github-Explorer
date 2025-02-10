import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PublicRepositoriesList from '../components/PublicRepositoriesList';
import { searchRepositories } from '../services/github';

// Mock the GitHub service
jest.mock('../services/github');

describe('PublicRepositoriesList', () => {
  const mockRepositories = {
    items: [
      {
        id: 1,
        name: 'repo-1',
        description: 'Test repository 1',
        stargazers_count: 100,
        forks_count: 50,
        language: 'JavaScript',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'repo-2',
        description: 'Test repository 2',
        stargazers_count: 200,
        forks_count: 75,
        language: 'Python',
        updated_at: '2023-02-01T00:00:00Z'
      }
    ]
  };

  beforeEach(() => {
    searchRepositories.mockReset();
    searchRepositories.mockResolvedValue(mockRepositories);
  });

  test('renders loading state initially', () => {
    render(<PublicRepositoriesList username="testuser" />);
    expect(screen.getByText(/Loading repositories/i)).toBeInTheDocument();
  });

  test('renders repositories after loading', async () => {
    render(<PublicRepositoriesList username="testuser" />);
    
    await waitFor(() => {
      expect(screen.getByText('repo-1')).toBeInTheDocument();
      expect(screen.getByText('repo-2')).toBeInTheDocument();
    });
  });

  test('handles filter input', async () => {
    render(<PublicRepositoriesList username="testuser" />);
    
    const filterInput = screen.getByPlaceholderText(/filter repositories/i);
    fireEvent.change(filterInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(searchRepositories).toHaveBeenCalledWith(
        'user:testuser test',
        expect.any(Object)
      );
    });
  });

  test('handles sort selection', async () => {
    render(<PublicRepositoriesList username="testuser" />);
    
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'forks' } });
    
    await waitFor(() => {
      expect(searchRepositories).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ sort: 'forks' })
      );
    });
  });

  test('handles sort order toggle', async () => {
    render(<PublicRepositoriesList username="testuser" />);
    
    const orderButton = screen.getByText('↓');
    fireEvent.click(orderButton);
    
    await waitFor(() => {
      expect(searchRepositories).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ order: 'asc' })
      );
    });
  });

  test('handles load more', async () => {
    render(<PublicRepositoriesList username="testuser" />);
    
    await waitFor(() => {
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Load More'));
    
    await waitFor(() => {
      expect(searchRepositories).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ page: 2 })
      );
    });
  });

  test('handles error state', async () => {
    searchRepositories.mockRejectedValue(new Error('Failed to load'));
    render(<PublicRepositoriesList username="testuser" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load repositories/i)).toBeInTheDocument();
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  test('retries loading on error', async () => {
    searchRepositories.mockRejectedValueOnce(new Error('Failed to load'));
    render(<PublicRepositoriesList username="testuser" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load repositories/i)).toBeInTheDocument();
    });
    
    searchRepositories.mockResolvedValueOnce(mockRepositories);
    fireEvent.click(screen.getByText(/retry/i));
    
    await waitFor(() => {
      expect(screen.getByText('repo-1')).toBeInTheDocument();
      expect(screen.getByText('repo-2')).toBeInTheDocument();
    });
  });
});