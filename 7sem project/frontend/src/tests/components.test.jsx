import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';
import Login from '../pages/Login';
import MusicRecommendations from '../components/MusicRecommendations';

// Mock fetch globally
global.fetch = vi.fn();

describe('Frontend Component Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // 1. Navbar State Test
  it('Navbar renders correctly when logged out', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  // 2. Navbar Logged In State Test
  it('Navbar renders correctly when logged in', () => {
    localStorage.setItem('token', 'fake-token');
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  // 3. Login Form Validation Test
  it('Login prevents submission without fields', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const button = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(button);
    
    // fetch should not be called because HTML5 validation stops it
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // 4. MusicRecommendations Render Test
  it('MusicRecommendations renders loading state initially', () => {
    // Mock the fetch to never resolve so we can see loading state
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<MusicRecommendations emotion="happy" />);
    
    expect(screen.getByText(/Curating your personalized playlist/i)).toBeInTheDocument();
  });

  // 5. MusicRecommendations Data Fetch Test
  it('MusicRecommendations renders tracks after fetch', async () => {
    const mockData = {
      source: 'mock',
      tracks: [
        { id: '1', title: 'Test Song', artist: 'Test Artist', genre: 'pop', album_art: '', preview_url: '' }
      ]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<MusicRecommendations emotion="happy" />);

    // Wait for the loading to finish and track to appear
    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('👍 Like')).toBeInTheDocument();
    });
  });
});
