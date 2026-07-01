// Minimal GitHub Contents API client used by the in-site blog admin editor.
// GitHub's REST API supports CORS, so these calls work directly from the browser
// given a personal access token with "Contents: Read and write" access to the repo.

export const GITHUB_OWNER = "stefanosu";
export const GITHUB_REPO = "stefanos-built-space";
export const GITHUB_BRANCH = "main";
export const POSTS_DIR = "src/data/posts";

const API_BASE = "https://api.github.com";

export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export function utf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64ToUtf8(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export interface GitHubFile {
  path: string;
  sha: string;
  content: string; // decoded UTF-8 content
}

/** Verifies the token can read the repo. Throws GitHubApiError on failure. */
export async function verifyToken(token: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) {
    throw new GitHubApiError(
      res.status === 401 || res.status === 403
        ? "That token was rejected. Check it has Contents read/write access to this repo."
        : `Could not reach repo (status ${res.status}).`,
      res.status
    );
  }
}

/** Fetches a file's decoded content + sha. Returns null if the file doesn't exist. */
export async function getFile(
  token: string,
  path: string
): Promise<GitHubFile | null> {
  const res = await fetch(
    `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: authHeaders(token) }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubApiError(`Failed to fetch ${path} (${res.status})`, res.status);
  }
  const data = await res.json();
  return {
    path,
    sha: data.sha,
    content: base64ToUtf8(data.content),
  };
}

/** Lists files (name + sha) currently in the posts directory. */
export async function listPostFiles(
  token: string
): Promise<{ name: string; sha: string }[]> {
  const res = await fetch(
    `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_DIR}?ref=${GITHUB_BRANCH}`,
    { headers: authHeaders(token) }
  );
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new GitHubApiError(
      `Failed to list ${POSTS_DIR} (${res.status})`,
      res.status
    );
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry: any) => entry.type === "file" && entry.name.endsWith(".ts"))
    .map((entry: any) => ({ name: entry.name, sha: entry.sha }));
}

/** Creates or updates a file. Pass `sha` when updating an existing file. */
export async function putFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ sha: string }> {
  const res = await fetch(
    `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: utf8ToBase64(content),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new GitHubApiError(
      body.message || `Failed to write ${path} (${res.status})`,
      res.status
    );
  }
  const data = await res.json();
  return { sha: data.content.sha };
}

export async function deleteFile(
  token: string,
  path: string,
  message: string,
  sha: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new GitHubApiError(
      body.message || `Failed to delete ${path} (${res.status})`,
      res.status
    );
  }
}
