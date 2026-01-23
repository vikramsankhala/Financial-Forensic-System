import { render, screen } from "@testing-library/react";

describe("frontend smoke test", () => {
  it("renders a simple element", () => {
    render(<div>Frontend test ready</div>);
    expect(screen.getByText("Frontend test ready")).toBeInTheDocument();
  });
});
