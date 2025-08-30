export const clip = (s = "", max) =>
  s.length > max ? s.slice(0, max - 1).trim() : s;

export const titleCase = (s = "") =>
  s
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

export const slug = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
