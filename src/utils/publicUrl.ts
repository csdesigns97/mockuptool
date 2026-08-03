/**
 * Resolves a path under /public against the app's configured base URL
 * (e.g. "/mockuptool/" in production on GitHub Pages, "/" in dev), since
 * Vite only rewrites asset URLs it processes through its build pipeline —
 * plain string literals like glTF model paths are left untouched otherwise.
 */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
