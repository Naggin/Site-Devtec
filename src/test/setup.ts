import "@testing-library/jest-dom/vitest";

// jsdom does not implement HTMLCanvasElement.getContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(HTMLCanvasElement.prototype as any).getContext = () => null;

// jsdom does not implement IntersectionObserver. The stub reports the element
// as visible so components driven by visibility behave like they do in a browser.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];

  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// jsdom does not implement matchMedia
if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
