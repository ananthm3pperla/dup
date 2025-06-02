import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthIndicator } from "@/components/ui";

describe("PasswordStrengthIndicator", () => {
  it("renders nothing when password is empty", () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows "Very weak" for password without any requirements met', () => {
    render(<PasswordStrengthIndicator password="abc" />);
    expect(screen.getByText("Very weak")).toBeInTheDocument();
  });

  it('shows "Weak" for password with only one requirement met', () => {
    render(<PasswordStrengthIndicator password="abcdefgh" />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it('shows "Fair" for password with two requirements met', () => {
    render(<PasswordStrengthIndicator password="Abcdefgh" />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
  });

  it('shows "Good" for password with three requirements met', () => {
    render(<PasswordStrengthIndicator password="Abcdefg1" />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it('shows "Strong" for password with all requirements met', () => {
    render(<PasswordStrengthIndicator password="Abcdefg1!" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("shows correct requirement statuses", () => {
    render(<PasswordStrengthIndicator password="Ab1" />);

    // Check requirements list
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(
      screen.getByText("At least one uppercase letter"),
    ).toBeInTheDocument();
    expect(screen.getByText("At least one number")).toBeInTheDocument();
    expect(
      screen.getByText("At least one special character"),
    ).toBeInTheDocument();

    // The length requirement shouldn't be marked as met
    const lengthRequirement = screen.getByText("At least 8 characters");
    expect(lengthRequirement.parentElement).not.toHaveClass("text-green-600");

    // The uppercase requirement should be marked as met
    const uppercaseRequirement = screen.getByText(
      "At least one uppercase letter",
    );
    expect(uppercaseRequirement.parentElement).toHaveClass("text-green-600");

    // The number requirement should be marked as met
    const numberRequirement = screen.getByText("At least one number");
    expect(numberRequirement.parentElement).toHaveClass("text-green-600");

    // The special character requirement shouldn't be marked as met
    const specialCharRequirement = screen.getByText(
      "At least one special character",
    );
    expect(specialCharRequirement.parentElement).not.toHaveClass(
      "text-green-600",
    );
  });

  it("applies custom class name", () => {
    const { container } = render(
      <PasswordStrengthIndicator password="abc" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
