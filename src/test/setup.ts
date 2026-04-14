import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => "blob:mock") as typeof URL.createObjectURL;
}

if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;
}

vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
