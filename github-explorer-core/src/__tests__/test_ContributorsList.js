import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContributorsList from '../components/ContributorsList';
import { getRepositoryContributors } from '../services/github';
import { getCacheItem, setCacheItem } from '../services/cache';

// Mock the github service
jest.mock('../services/github');
// Mock the cache service
jest.mock('../services/cache');

const mockContributors = [
  {
    id: 1,
    login: 'user1',
    avatar_url: 'https://avatar1.url',
    contributions: 100
  },
  {
    id: 2,
    login: 'user2',
    avatar_url: 'https://avatar2.url',
    contributions: 50
  }
];

describe('ContributorsList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset cache mocks
    getCacheItem.mockReset();
    setCacheItem.mockReset();
  });

  it('renders loading state initially', () => {
    getRepositoryContributors.mockResolvedValueOnce([]);
    render(<ContributorsList owner="testowner" repo="testrepo" />);
    expect(screen.getByText('Loading contributors...')).toBeInTheDocument();
  });

  it('fetches and displays contributors', async () => {
    getRepositoryContributors.mockResolvedValueOnce(mockContributors);
    getCacheItem.mockReturnValue(null);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    // Wait for contributors to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    // Verify contributor details are displayed
    expect(screen.getByText('100 contributions')).toBeInTheDocument();
    expect(screen.getByText('50 contributions')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('handles sorting change', async () => {
    getRepositoryContributors.mockResolvedValueOnce(mockContributors);
    getCacheItem.mockReturnValue(null);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    // Change sort option
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'contributions' } });

    // Verify that the API was called with new sort parameter
    expect(getRepositoryContributors).toHaveBeenCalledWith(
      'testowner',
      'testrepo',
      expect.objectContaining({ sort: 'contributions', page: 1 })
    );
  });

  it('loads more contributors when clicking load more button', async () => {
    // First page of contributors
    getRepositoryContributors.mockResolvedValueOnce(mockContributors);
    getCacheItem.mockReturnValue(null);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    await waitFor(() => {
      expect(screen.getByText('Load More Contributors')).toBeInTheDocument();
    });

    // Mock second page of contributors
    const secondPageContributors = [
      {
        id: 3,
        login: 'user3',
        avatar_url: 'https://avatar3.url',
        contributions: 25
      }
    ];
    getRepositoryContributors.mockResolvedValueOnce(secondPageContributors);

    // Click load more button
    fireEvent.click(screen.getByText('Load More Contributors'));

    // Verify that the API was called with page 2
    expect(getRepositoryContributors).toHaveBeenCalledWith(
      'testowner',
      'testrepo',
      expect.objectContaining({ page: 2 })
    );

    // Wait for new contributors to load
    await waitFor(() => {
      expect(screen.getByText('user3')).toBeInTheDocument();
    });
  });

  it('uses cached data when available', async () => {
    // Mock cached data
    getCacheItem.mockReturnValueOnce(mockContributors);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    // Verify that cached data is used
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    // Verify that the API was not called
    expect(getRepositoryContributors).not.toHaveBeenCalled();
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to fetch contributors';
    getRepositoryContributors.mockRejectedValueOnce(new Error(errorMessage));
    getCacheItem.mockReturnValue(null);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('caches fetched data', async () => {
    getRepositoryContributors.mockResolvedValueOnce(mockContributors);
    getCacheItem.mockReturnValue(null);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    await waitFor(() => {
      expect(setCacheItem).toHaveBeenCalledWith(
        'contributors_testowner/testrepo_commits_1',
        mockContributors
      );
    });
  });

  it('shows no more contributors when hasMore is false', async () => {
    // Return less than 30 contributors to indicate no more pages
    const fewContributors = [mockContributors[0]];
    getRepositoryContributors.mockResolvedValueOnce(fewContributors);
    getCacheItem.mockReturnValue(null);

    render(<ContributorsList owner="testowner" repo="testrepo" />);

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Verify that the "Load More" button is not present
    expect(screen.queryByText('Load More Contributors')).not.toBeInTheDocument();
  });
});