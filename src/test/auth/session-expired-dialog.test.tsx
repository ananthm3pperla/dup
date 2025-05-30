import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionExpiredDialog } from '@/components/auth';

// Mock the handlers
const mockRefresh = vi.fn().mockResolvedValue(undefined);
const mockLogout = vi.fn().mockResolvedValue(undefined);

describe('SessionExpiredDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const { container } = render(
      <SessionExpiredDialog 
        isOpen={false} 
        onRefresh={mockRefresh} 
        onLogout={mockLogout}
        isRefreshing={false}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders the dialog when open', () => {
    render(
      <SessionExpiredDialog 
        isOpen={true} 
        onRefresh={mockRefresh} 
        onLogout={mockLogout}
        isRefreshing={false}
      />
    );
    
    expect(screen.getByText('Session Expired')).toBeInTheDocument();
    expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <SessionExpiredDialog 
        isOpen={true} 
        onRefresh={mockRefresh} 
        onLogout={mockLogout}
        isRefreshing={false}
      />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh session/i });
    fireEvent.click(refreshButton);
    
    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('calls onLogout when sign out button is clicked', () => {
    render(
      <SessionExpiredDialog 
        isOpen={true} 
        onRefresh={mockRefresh} 
        onLogout={mockLogout}
        isRefreshing={false}
      />
    );
    
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('disables buttons when refreshing', () => {
    render(
      <SessionExpiredDialog 
        isOpen={true} 
        onRefresh={mockRefresh} 
        onLogout={mockLogout}
        isRefreshing={true}
      />
    );
    
    const refreshButton = screen.getByRole('button', { name: /refresh session/i });
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    
    expect(refreshButton).toBeDisabled();
    expect(logoutButton).toBeDisabled();
  });
});