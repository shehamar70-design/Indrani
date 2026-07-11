import { describe, it, expect } from "vitest";
import { t, isLocale, LOCALE_COOKIE, locales } from "./i18n";

describe("i18n dictionary", () => {
  it("resolves dot-path keys in en", () => {
    expect(t("en", "common.loading")).toBe("Loading…");
  });
  it("resolves hi translations", () => {
    expect(t("hi", "common.loading")).toBe("लोड हो रहा है…");
  });
  it("falls back to en when hi key missing", () => {
    // key that exists in en; if missing in hi it must not return the raw key
    expect(t("hi", "common.delayed")).not.toBe("common.delayed");
  });
  it("returns the key itself when missing everywhere", () => {
    expect(t("en", "does.not.exist")).toBe("does.not.exist");
  });
});

describe("locale helpers", () => {
  it("validates locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("hi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
  it("exports cookie name and locale list", () => {
    expect(LOCALE_COOKIE).toBe("indrani_locale");
    expect(locales).toEqual(["en", "hi"]);
  });
});
