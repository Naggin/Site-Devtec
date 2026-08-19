import "@testing-library/jest-dom/vitest";

// jsdom does not implement IntersectionObserver
if (typeof IntersectionObserver === "undefined") {
  class MockIO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIO,
  });
}
