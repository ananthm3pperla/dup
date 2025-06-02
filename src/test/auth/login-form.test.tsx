import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "@/components/auth";
import { BrowserRouter } from "react-router-dom";

// Mock the handlers
const mockSubmit = vi.fn();

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(
      <BrowserRouter>
        <LoginForm onSubmit={mockSubmit} isSubmitting={false} />
      </BrowserRouter>,
    );

    // Check if form elements are present
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it("validates the form before submission", async () => {
    render(
      <BrowserRouter>
        <LoginForm onSubmit={mockSubmit} isSubmitting={false} />
      </BrowserRouter>,
    );

    // Try to submit with invalid data
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    // Check that onSubmit was not called
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("submits valid form data", async () => {
    render(
      <BrowserRouter>
        <LoginForm onSubmit={mockSubmit} isSubmitting={false} />
      </BrowserRouter>,
    );

    // Fill in valid data
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.click(rememberMeCheckbox);

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitButton);

    // Check that onSubmit was called with correct data
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        "test@example.com",
        "Password123!",
        true,
      );
    });
  });

  it("disables the form when submitting", () => {
    render(
      <BrowserRouter>
        <LoginForm onSubmit={mockSubmit} isSubmitting={true} />
      </BrowserRouter>,
    );

    // Check if submit button is disabled
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it("displays error message when provided", () => {
    const errorMessage = "Invalid credentials";
    render(
      <BrowserRouter>
        <LoginForm
          onSubmit={mockSubmit}
          isSubmitting={false}
          error={errorMessage}
        />
      </BrowserRouter>,
    );

    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(
      <BrowserRouter>
        <LoginForm onSubmit={mockSubmit} isSubmitting={false} />
      </BrowserRouter>,
    );

    // Get password input and toggle button
    const passwordInput = screen.getByLabelText(
      /password/i,
    ) as HTMLInputElement;

    // Password should be hidden initially
    expect(passwordInput.type).toBe("password");

    // Find and click the toggle button (it doesn't have text, so we use the parent element)
    const toggleButton = passwordInput.parentElement?.querySelector("button");
    if (toggleButton) fireEvent.click(toggleButton);

    // Password should now be visible
    expect(passwordInput.type).toBe("text");
  });
});
