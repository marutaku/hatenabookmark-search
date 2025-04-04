import { vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

vi.mock("@raycast/api");

afterEach(() => {
  cleanup();
});
