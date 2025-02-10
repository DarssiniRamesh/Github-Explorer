import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the github service
jest.mock('../services/github', () => ({
  searchRepositories: jest.fn(),
  getRepositoryDetails: jest.fn()
}));

// Mock the cache service
jest.mock('../services/cache', () => ({
  getCachedSearch: jest.fn(),
  cacheSearch: jest.fn(),
  getCachedRepository: jest.fn(),
  cacheRepository: jest.fn()
}));

import { searchRepositories, getRepositoryDetails } from '../services/github';
import { getCachedSearch, cacheSearch, getCachedRepository, cacheRepository } from '../services/cache';

describe('App Component Integration', () => {
  const mockRepositories = [
    {
      id: 1,
      full_name: 'facebook/react',
      description: 'A JavaScript library for building user interfaces'
    }
  ];

  const mockRepositoryDetails = {
    id: 1,
    full_name: 'facebook/react',
    description: 'A JavaScript library for building user interfaces',
    stargazers_count: 1000,
    forks_count: 500
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    searchRepositories.mockResolvedValue(mockRepositories);
    getRepositoryDetails.mockResolvedValue(mockRepositoryDetails);
    getCachedSearch.mockReturnValue(null);
    getCachedRepository.mockReturnValue(null);
  });

  test('performs search and displays results', async () => {
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText('Search GitHub repositories...');
    const searchButton = screen.getByRole('button', { name: /search/i });

    // Perform search
    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.click(searchButton);

    // Verify loading state
    expect(screen.getByText('Loading repositories...')).toBeInTheDocument();

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeInTheDocument();
    });

    // Verify cache interaction
    expect(getCachedSearch).toHaveBeenCalledWith('react');
    expect(cacheSearch).toHaveBeenCalledWith('react', mockRepositories);
  });

  test('handles search errors', async () => {
    const errorMessage = 'API rate limit exceeded';
    searchRepositories.mockRejectedValue(new Error(errorMessage));

    render(<App />);
    
    const searchInput = screen.getByPlaceholderText('Search GitHub repositories...');
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays repository details when repository is selected', async () => {
    render(<App />);
    
    // Perform search
    const searchInput = screen.getByPlaceholderText('Search GitHub repositories...');
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.click(searchButton);

    // Wait for and click on repository
    await waitFor(() => {
      const repositoryItem = screen.getByText('facebook/react');
      fireEvent.click(repositoryItem);
    });

    // Verify repository details are displayed
    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument(); // stargazers count
      expect(screen.getByText('500')).toBeInTheDocument(); // forks count
    });

    // Verify cache interaction
    expect(getCachedRepository).toHaveBeenCalledWith(mockRepositories[0].full_name);
    expect(cacheRepository).toHaveBeenCalledWith(mockRepositories[0].full_name, mockRepositoryDetails);
  });

  test('uses cached data when available', async () => {
    getCachedSearch.mockReturnValue(mockRepositories);
    getCachedRepository.mockReturnValue(mockRepositoryDetails);

    render(<App />);
    
    const searchInput = screen.getByPlaceholderText('Search GitHub repositories...');
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.click(searchButton);

    // Results should be immediate since they're cached
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(searchRepositories).not.toHaveBeenCalled();

    // Click repository
    fireEvent.click(screen.getByText('facebook/react'));

    // Details should be immediate since they're cached
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(getRepositoryDetails).not.toHaveBeenCalled();
  });

  test('closes repository details view', async () => {
    render(<App />);
    
    // Perform search and select repository
    const searchInput = screen.getByPlaceholderText('Search GitHub repositories...');
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      const repositoryItem = screen.getByText('facebook/react');
      fireEvent.click(repositoryItem);
    });

    // Wait for details to be displayed
    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    // Close details
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    // Verify details are closed
    expect(screen.queryByText('1000')).not.toBeInTheDocument();
  });
});