const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const basePath = BASE_PATH;

export const withBasePath = (path: string) => {
  if (!path) return basePath || "";
  if (/^https?:\/\//i.test(path)) return path;
  if (basePath && path.startsWith(basePath)) return path;
  if (basePath && path.startsWith("/")) return `${basePath}${path}`;
  return path;
};
