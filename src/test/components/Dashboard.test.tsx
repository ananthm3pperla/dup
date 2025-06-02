
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';

// Mock the API
vi.mock('../../lib/api', () => ({
  analyticsAPI: {
    getDashboard: vi.fn().mockResolvedValue({
      success: true,
      data: {
        totalEmployees: 156,
        officeAttendance: 78,
        remoteWorkers: 78,
        averageMood: 4.2
      }
    })
  },
  pulseAPI: {
    getUserPulses: vi.fn().mockResolvedValue({
      success: true,
      data: {}
    })
  }
}));

const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User'
  }
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updatePassword: vi.fn()
};

const mockThemeContext = {
  theme: 'light' as const,
  setTheme: vi.fn()
};

function renderWithProviders(component: React.ReactElement) {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <ThemeContext.Provider value={mockThemeContext}>
          {component}
        </ThemeContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard header', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Good/)).toBeInTheDocument();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });
  });

  it('displays daily pulse section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/How are you feeling today/)).toBeInTheDocument();
    });
  });

  it('shows office attendance metrics', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Office Attendance/)).toBeInTheDocument();
    });
  });
});
