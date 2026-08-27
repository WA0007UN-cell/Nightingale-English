import { describe, expect, it } from "vitest";
import { getTimeAwareGreeting } from "./greeting";

describe("getTimeAwareGreeting", () => {
  it("uses morning copy from 00:00 through 11:59", () => {
    expect(getTimeAwareGreeting(0)).toBe("Good morning");
    expect(getTimeAwareGreeting(11)).toBe("Good morning");
  });

  it("uses afternoon copy from 12:00 through 17:59", () => {
    expect(getTimeAwareGreeting(12)).toBe("Good afternoon");
    expect(getTimeAwareGreeting(17)).toBe("Good afternoon");
  });

  it("uses evening copy from 18:00 through 23:59", () => {
    expect(getTimeAwareGreeting(18)).toBe("Good evening");
    expect(getTimeAwareGreeting(23)).toBe("Good evening");
  });
});
