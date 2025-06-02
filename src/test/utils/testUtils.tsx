
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { ThemeContext, ThemeContextType } from '../../contexts/ThemeContext';

// Default mock values
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  updatePassword: jest.fn()
};

const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  setTheme: jest.fn()
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: Partial<AuthContextType>;
  themeContext?: Partial<ThemeContextType>;
}

/**
 * Custom render function that includes necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    authContext = {},
    themeContext = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const mergedAuthContext = { ...defaultAuthContext, ...authContext };
  const mergedThemeContext = { ...defaultThemeContext, ...themeContext };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={mergedAuthContext}>
          <ThemeContext.Provider value={mergedThemeContext}>
            {children}
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  employee: {
    id: 'emp-123',
    email: 'employee@company.com',
    user_metadata: {
      full_name: 'John Employee',
      role: 'employee'
    }
  },
  manager: {
    id: 'mgr-123',
    email: 'manager@company.com',
    user_metadata: {
      full_name: 'Jane Manager',
      role: 'manager'
    }
  },
  hr: {
    id: 'hr-123',
    email: 'hr@company.com',
    user_metadata: {
      full_name: 'Bob HR',
      role: 'hr'
    }
  }
};

/**
 * Utility to wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from '@testing-library/react';
