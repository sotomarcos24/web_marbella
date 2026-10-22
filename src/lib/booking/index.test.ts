import { describe, expect, it } from "vitest";
import { bookingProvider } from "@/lib/booking";
import { MockBookingProvider } from "./mock";

// Que nadie más importe el mock lo vigila la regla `no-restricted-imports` de eslint.config.mjs.
describe("punto de composición", () => {
  it("bookingProvider es, de momento, el mock", () => {
    expect(bookingProvider).toBeInstanceOf(MockBookingProvider);
  });
});
