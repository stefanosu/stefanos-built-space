import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordGate from "@/components/admin/PasswordGate";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blogPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/data/types";
import {
  GitHubApiError,
  POSTS_DIR,
  deleteFile,
  getFile,
  putFile,
  verifyToken,
} from "@/lib/github";

const TOKEN_STORAGE_KEY = "admin-github-token";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function estimateReadTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function escapeForTemplateLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function generatePostFileContent(post: BlogPost): string {
  return `import { BlogPost } from "../types";

const post: BlogPost = {
  slug: ${JSON.stringify(post.slug)},
  title: ${JSON.stringify(post.title)},
  excerpt: ${JSON.stringify(post.excerpt)},
  content: \`
${escapeForTemplateLiteral(post.content)}
  \`,
  date: ${JSON.stringify(post.date)},
  readTime: ${JSON.stringify(post.readTime)},
  tags: ${JSON.stringify(post.tags)},
};

export default post;
`;
}

const emptyForm = {
  originalSlug: null as string | null,
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  readTime: "",
  tagsInput: "",
};

type Status =
  | { type: "idle" }
  | { type: "publishing" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const AdminWriteEditor = () => {
  const [postsList, setPostsList] = useState<BlogPost[]>(blogPosts);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [readTimeTouched, setReadTimeTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const [token, setToken] = useState("");
  const [rememberToken, setRememberToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    { type: "idle" } | { type: "checking" } | { type: "valid" } | { type: "invalid"; message: string }
  >({ type: "idle" });

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) {
      setToken(saved);
      setRememberToken(true);
    }
  }, []);

  useEffect(() => {
    if (rememberToken && token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else if (!rememberToken) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token, rememberToken]);

  const computedReadTime = useMemo(
    () => estimateReadTime(form.content),
    [form.content]
  );

  const displayedReadTime = readTimeTouched
    ? form.readTime
    : form.readTime || computedReadTime;

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSlugTouched(false);
    setReadTimeTouched(false);
    setStatus({ type: "idle" });
  };

  const loadPostIntoForm = (post: BlogPost) => {
    setForm({
      originalSlug: post.slug,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content.trim(),
      date: post.date,
      readTime: post.readTime,
      tagsInput: post.tags.join(", "),
    });
    setSlugTouched(true);
    setReadTimeTouched(true);
    setStatus({ type: "idle" });
    window.scrollTo({ top: document.getElementById("editor")?.offsetTop ?? 0, behavior: "smooth" });
  };

  const handleVerifyToken = async () => {
    if (!token) return;
    setTokenStatus({ type: "checking" });
    try {
      await verifyToken(token);
      setTokenStatus({ type: "valid" });
    } catch (err) {
      setTokenStatus({
        type: "invalid",
        message: err instanceof GitHubApiError ? err.message : "Could not verify token.",
      });
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!token) {
      setStatus({ type: "error", message: "Enter your GitHub token before deleting posts." });
      return;
    }
    if (!window.confirm(`Delete "${post.title}"? This commits directly to main.`)) {
      return;
    }
    setStatus({ type: "publishing" });
    try {
      const path = `${POSTS_DIR}/${post.slug}.ts`;
      const existing = await getFile(token, path);
      if (!existing) {
        throw new Error("Could not find that post's file on GitHub.");
      }
      await deleteFile(token, path, `post: delete "${post.title}"`, existing.sha);
      setPostsList((list) => list.filter((p) => p.slug !== post.slug));
      setStatus({
        type: "success",
        message: `Deleted "${post.title}". The live site will update in ~1-2 minutes.`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete post.",
      });
    }
  };

  const handlePublish = async () => {
    setStatus({ type: "publishing" });
    try {
      if (!token) throw new Error("Enter your GitHub token first.");

      const finalSlug = form.slug.trim() || slugify(form.title);
      if (!finalSlug) throw new Error("Title (or slug) is required.");
      if (!form.title.trim()) throw new Error("Title is required.");
      if (!form.content.trim()) throw new Error("Content is required.");

      const tags = form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const post: BlogPost = {
        slug: finalSlug,
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        date: form.date,
        readTime: displayedReadTime,
        tags,
      };

      const path = `${POSTS_DIR}/${finalSlug}.ts`;
      const fileContent = generatePostFileContent(post);
      const existing = await getFile(token, path);
      const isUpdate = Boolean(existing);
      const message = `post: ${isUpdate ? "update" : "publish"} "${post.title}"`;

      await putFile(token, path, fileContent, message, existing?.sha);

      // If the slug changed while editing an existing post, remove the old file.
      if (form.originalSlug && form.originalSlug !== finalSlug) {
        const oldPath = `${POSTS_DIR}/${form.originalSlug}.ts`;
        const oldFile = await getFile(token, oldPath);
        if (oldFile) {
          await deleteFile(token, oldPath, `post: rename "${post.title}"`, oldFile.sha);
        }
      }

      setPostsList((list) => {
        const withoutOld = list.filter(
          (p) => p.slug !== finalSlug && p.slug !== form.originalSlug
        );
        return [post, ...withoutOld].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      setStatus({
        type: "success",
        message: `${isUpdate ? "Updated" : "Published"} "${post.title}". GitHub Actions will redeploy the site in ~1-2 minutes.`,
      });
      resetForm();
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof GitHubApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Something went wrong publishing this post.",
      });
    }
  };

  const isPublishing = status.type === "publishing";
  const isEditingExisting = form.originalSlug !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <div>
              <Button asChild variant="ghost" className="mb-6 -ml-4">
                <Link to="/writing">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Writing
                </Link>
              </Button>
              <h1 className="text-4xl font-semibold mb-2">Write a post</h1>
              <p className="text-muted-foreground">
                Publishing commits directly to the <code>main</code> branch on
                GitHub and triggers the usual deploy.
              </p>
            </div>

            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Keep your token private</AlertTitle>
              <AlertDescription>
                Use a fine-grained GitHub personal access token scoped only to this
                repo's "Contents: Read and write" permission. It's stored only in
                this browser (never sent anywhere except GitHub's API) and you can
                revoke it anytime from GitHub settings.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GitHub token</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="password"
                    placeholder="ghp_..."
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setTokenStatus({ type: "idle" });
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyToken}
                    disabled={!token || tokenStatus.type === "checking"}
                  >
                    {tokenStatus.type === "checking" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-token"
                    checked={rememberToken}
                    onCheckedChange={(checked) => setRememberToken(checked === true)}
                  />
                  <Label htmlFor="remember-token" className="text-sm text-muted-foreground">
                    Remember this token on this device
                  </Label>
                </div>

                {tokenStatus.type === "valid" && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Token verified.
                  </p>
                )}
                {tokenStatus.type === "invalid" && (
                  <p className="text-sm text-destructive">{tokenStatus.message}</p>
                )}
              </CardContent>
            </Card>

            {postsList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Existing posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {postsList.map((post) => (
                    <div
                      key={post.slug}
                      className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{post.title}</p>
                        <p className="text-sm text-muted-foreground">{post.date}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => loadPostIntoForm(post)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(post)}
                          disabled={isPublishing}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card id="editor">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isEditingExisting ? `Editing "${form.title}"` : "New post"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="A great post title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                      }}
                      placeholder="a-great-post-title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="One or two sentences shown on the Writing list"
                    rows={2}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="readTime">Read time</Label>
                    <Input
                      id="readTime"
                      value={displayedReadTime}
                      onChange={(e) => {
                        setReadTimeTouched(true);
                        setForm((f) => ({ ...f, readTime: e.target.value }));
                      }}
                      placeholder={computedReadTime}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={form.tagsInput}
                      onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
                      placeholder="Clean Architecture, .NET"
                    />
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content (Markdown)</Label>
                    <Textarea
                      id="content"
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder="## Write your post in Markdown..."
                      className="min-h-[420px] font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="min-h-[420px] max-h-[600px] overflow-y-auto rounded-md border border-input bg-background p-4">
                      {form.content ? (
                        <MarkdownRenderer
                          content={form.content}
                          className="prose prose-invert prose-sm max-w-none"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Your rendered post will appear here as you type.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {status.type === "success" && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}
                {status.type === "error" && (
                  <Alert variant="destructive">
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-3">
                  <Button type="button" onClick={handlePublish} disabled={isPublishing}>
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : isEditingExisting ? (
                      "Save changes"
                    ) : (
                      "Publish"
                    )}
                  </Button>
                  {isEditingExisting && (
                    <Button type="button" variant="ghost" onClick={resetForm} disabled={isPublishing}>
                      Cancel edit / start new post
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const AdminWrite = () => (
  <PasswordGate>
    <AdminWriteEditor />
  </PasswordGate>
);

export default AdminWrite;
