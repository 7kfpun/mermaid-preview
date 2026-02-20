import { render, screen, fireEvent } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header";
import { STORAGE_KEYS } from "../../utils/constants";

vi.mock("../../utils/ga", () => ({ trackEvent: vi.fn() }));

const mockChangeLanguage = vi.fn();
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback ?? key,
    i18n: {
      language: "en",
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

const renderHeader = (props = {}) =>
  render(
    <MemoryRouter initialEntries={[props.path ?? "/"]}>
      <Header toggleDarkMode={vi.fn()} darkMode={false} {...props} />
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the app title heading", () => {
    renderHeader();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("renders Editor and Gallery navigation links", () => {
    renderHeader();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
  });

  it("marks the Editor link as active on /", () => {
    renderHeader({ path: "/" });
    expect(screen.getByText("Editor")).toHaveClass("active");
    expect(screen.getByText("Gallery")).not.toHaveClass("active");
  });

  it("marks the Gallery link as active on /gallery", () => {
    renderHeader({ path: "/gallery" });
    expect(screen.getByText("Gallery")).toHaveClass("active");
    expect(screen.getByText("Editor")).not.toHaveClass("active");
  });

  it("renders a language selector with 20 options", () => {
    renderHeader();
    const select = screen.getByRole("combobox");
    expect(select.options.length).toBe(20);
  });

  it("saves selected language to localStorage on change", () => {
    renderHeader();
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "fr" } });
    expect(localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe("fr");
  });

  it("calls i18n.changeLanguage on language change", () => {
    renderHeader();
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "de" } });
    expect(mockChangeLanguage).toHaveBeenCalledWith("de");
  });

  it("calls toggleDarkMode when dark mode button is clicked", () => {
    const toggleDarkMode = vi.fn();
    renderHeader({ toggleDarkMode });
    fireEvent.click(screen.getByRole("button"));
    expect(toggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it("shows sun icon (circle element) when darkMode is true", () => {
    const { container } = renderHeader({ darkMode: true });
    expect(container.querySelector("circle")).toBeInTheDocument();
  });

  it("shows moon icon (no circle) when darkMode is false", () => {
    const { container } = renderHeader({ darkMode: false });
    expect(container.querySelector("path[d^='M21']")).toBeInTheDocument();
    expect(container.querySelector("circle")).not.toBeInTheDocument();
  });
});
