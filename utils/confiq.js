export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const siteUrl = (path = "") =>
  `${SITE_URL}${String(path).startsWith("/") || !path ? path : `/${path}`}`;

// Origin that serves static images from the backend's /public/uploads folder.
// Images are referenced as `${UPLOADS_URL}/uploads/images/<file>` (and /banner).
// Derived from the API URL by stripping the trailing "/api/v1".
export const UPLOADS_URL = BASE_URL.replace(/\/api\/v1\/?$/, "");

// Helper for building an uploads URL, e.g. uploadsImg("images/logo.png").
export const uploadsImg = (p = "") =>
  `${UPLOADS_URL}/uploads/${String(p).replace(/^\/+/, "")}`;
