import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  test('renders search input and button', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
    
    expect(screen.getByPlaceholderText('Search GitHub repositories...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Search');
  });

  test('handles form submission with valid input', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Search GitHub repositories...');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('react');
  });

  test('prevents submission with empty input', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('disables input and button when loading', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('Search GitHub repositories...');
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Searching...');
  });

  test('trims whitespace from search query', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Search GitHub repositories...');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '  react  ' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('react');
  });
});