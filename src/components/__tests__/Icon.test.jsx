import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Icon from "../Icon";
import { samples } from "../../utils/constants";

describe("Icon", () => {
  it("renders an SVG for every diagram type defined in samples", () => {
    Object.keys(samples).forEach((type) => {
      const { container } = render(<Icon type={type} />);
      expect(
        container.querySelector("svg"),
        `expected an SVG for type "${type}"`,
      ).toBeInTheDocument();
    });
  });

  it("returns null for an unknown diagram type", () => {
    const { container } = render(<Icon type="unknown_xyz" />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when type is undefined", () => {
    const { container } = render(<Icon />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when type is empty string", () => {
    const { container } = render(<Icon type="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an SVG for the flowchart type", () => {
    const { container } = render(<Icon type="flowchart" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an SVG for the gantt type", () => {
    const { container } = render(<Icon type="gantt" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an SVG for the sequence type", () => {
    const { container } = render(<Icon type="sequence" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
