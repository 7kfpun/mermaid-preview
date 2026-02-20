import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import Footer from "../Footer";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("Footer", () => {
  it("renders the privacy policy text", () => {
    render(<Footer />);
    expect(screen.getByText("privacyPolicy")).toBeInTheDocument();
  });

  it("renders the bug report link with the correct href", () => {
    render(<Footer />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://forms.gle/JNDcyANZEqoBxpm37");
  });

  it("opens the bug report link in a new tab with safe rel attribute", () => {
    render(<Footer />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses the bugReport translation key for the link text", () => {
    render(<Footer />);
    expect(screen.getByText("bugReport")).toBeInTheDocument();
  });
});
