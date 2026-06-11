const fallbackApiUrl = "http://localhost:3333";

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
}
