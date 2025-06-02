import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react-hooks";
import { useThrottle } from "@/lib/hooks/useThrottle";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("throttles value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, limit }) => useThrottle(value, limit),
      { initialProps: { value: "initial", limit: 500 } },
    );

    // Change value multiple times within throttle window
    rerender({ value: "change1", limit: 500 });
    rerender({ value: "change2", limit: 500 });
    rerender({ value: "change3", limit: 500 });
    expect(result.current).toBe("initial");

    // Advance time to throttle limit
    vi.advanceTimersByTime(500);
    expect(result.current).toBe("change3");
  });

  it("allows updates after throttle period", () => {
    const { result, rerender } = renderHook(
      ({ value, limit }) => useThrottle(value, limit),
      { initialProps: { value: "initial", limit: 500 } },
    );

    // First update
    rerender({ value: "change1", limit: 500 });
    vi.advanceTimersByTime(500);
    expect(result.current).toBe("change1");

    // Second update after throttle period
    rerender({ value: "change2", limit: 500 });
    vi.advanceTimersByTime(500);
    expect(result.current).toBe("change2");
  });

  it("cleans up timer on unmount", () => {
    const { result, unmount } = renderHook(() => useThrottle("test", 500));
    unmount();
    vi.advanceTimersByTime(500);
    expect(result.current).toBe("test");
  });
});
