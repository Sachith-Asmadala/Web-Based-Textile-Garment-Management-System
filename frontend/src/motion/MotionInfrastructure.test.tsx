import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MotionPage } from "./MotionPage";
import { Reveal } from "./Reveal";

describe("motion infrastructure", () => {
  it("renders page content immediately", () => {
    render(<MotionPage>Operational content</MotionPage>);
    expect(screen.getByText("Operational content")).toBeInTheDocument();
  });

  it("keeps reveal content available when IntersectionObserver is unavailable", async () => {
    render(<Reveal>Revealed content</Reveal>);
    expect(screen.getByText("Revealed content")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Revealed content")).toHaveAttribute("data-motion-state", "visible"));
  });

  it("renders reveal content without delay when reduced motion is requested", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    });

    render(<Reveal>Reduced motion content</Reveal>);
    expect(screen.getByText("Reduced motion content")).toHaveAttribute("data-motion-state", "visible");
  });
});
