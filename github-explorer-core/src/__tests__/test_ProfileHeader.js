import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileHeader from '../components/ProfileHeader';

describe('ProfileHeader', () => {
  const mockUser = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    location: 'Test Location',
    email: 'test@example.com',
    blog: 'https://example.com',
    company: '@TestCompany',
    twitter_username: 'testuser',
    followers: 100,
    following: 50,
    public_repos: 25
  };

  it('renders loading state correctly', () => {
    render(<ProfileHeader loading={true} />);
    expect(screen.getByText(/Loading profile information/i)).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const error = { message: 'Test error message' };
    render(<ProfileHeader error={error} />);
    expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
  });

  it('renders user profile information correctly', () => {
    render(<ProfileHeader user={mockUser} />);

    // Check basic user info
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockUser.login}`)).toBeInTheDocument();
    expect(screen.getByText(mockUser.bio)).toBeInTheDocument();

    // Check stats
    expect(screen.getByText('100')).toBeInTheDocument(); // followers
    expect(screen.getByText('50')).toBeInTheDocument(); // following
    expect(screen.getByText('25')).toBeInTheDocument(); // public_repos

    // Check contact and social info
    expect(screen.getByText(mockUser.location)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.blog)).toBeInTheDocument();
    expect(screen.getByText(mockUser.company)).toBeInTheDocument();
    expect(screen.getByText(`@${mockUser.twitter_username}`)).toBeInTheDocument();
  });

  it('renders profile with minimal information', () => {
    const minimalUser = {
      login: 'minimaluser',
      avatar_url: 'https://example.com/avatar.jpg',
      followers: 0,
      following: 0,
      public_repos: 0
    };

    render(<ProfileHeader user={minimalUser} />);

    // Should show login as name when name is not provided
    expect(screen.getByText('minimaluser')).toBeInTheDocument();
    expect(screen.getByText('@minimaluser')).toBeInTheDocument();

    // Stats should show zeros
    expect(screen.getAllByText('0')).toHaveLength(3);

    // Optional fields should not be rendered
    expect(screen.queryByText(/Location:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Website:/i)).not.toBeInTheDocument();
  });

  it('renders avatar with correct alt text', () => {
    render(<ProfileHeader user={mockUser} />);
    const avatar = screen.getByAltText(`${mockUser.login}'s avatar`);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockUser.avatar_url);
  });
});