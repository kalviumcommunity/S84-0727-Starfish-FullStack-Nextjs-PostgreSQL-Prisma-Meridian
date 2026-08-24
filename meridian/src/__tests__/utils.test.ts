import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn (tailwind merge utils)", () => {
  it("should merge basic tailwind classes", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should correctly handle conditional classes", () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn("px-4 py-2", isActive && "bg-blue-500", isDisabled && "opacity-50")).toBe(
      "px-4 py-2 bg-blue-500",
    );
  });

  it("should correctly merge conflicting tailwind classes (override)", () => {
    // tailwind-merge should recognize that both are padding-x classes and keep the last one
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle arrays and nested arrays of classes", () => {
    expect(cn(["flex", "items-center"], ["justify-between"])).toBe(
      "flex items-center justify-between",
    );
  });
});
