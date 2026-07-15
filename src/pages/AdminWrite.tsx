import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Pencil, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordGate from "@/components/admin/PasswordGate";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogPost } from "@/data/types";
import {
  fetchPosts,
  fetchPost,
  savePost,
  deletePost,
  PostsApiError,
  type PostMeta,
} from "@/lib/postsApi";

const PASSWORD_STORAGE_KEY = "admin-password";

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
  const [postsList, setPostsList] = useState<PostMeta[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [readTimeTouched, setReadTimeTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (saved) {
      setPassword(saved);
    }
  }, []);

  useEffect(() => {
    if (password) {
      localStorage.setItem(PASSWORD_STORAGE_KEY, password);
    }
  }, [password]);

  useEffect(() => {
    fetchPosts()
      .then(setPostsList)
      .catch((err) => {
        console.error("Failed to load posts:", err);
      })
      .finally(() => setPostsLoading(false));
  }, []);

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

  const loadPostIntoForm = async (meta: PostMeta) => {
    setStatus({ type: "publishing" });
    try {
      const fullPost = await fetchPost(meta.slug);
      if (!fullPost) {
        setStatus({ type: "error", message: "Could not load post content." });
        return;
      }
      setForm({
        originalSlug: fullPost.slug,
        slug: fullPost.slug,
        title: fullPost.title,
        excerpt: fullPost.excerpt,
        content: fullPost.content.trim(),
        date: fullPost.date,
        readTime: fullPost.readTime,
        tagsInput: fullPost.tags.join(", "),
      });
      setSlugTouched(true);
      setReadTimeTouched(true);
      setStatus({ type: "idle" });
      window.scrollTo({ top: document.getElementById("editor")?.offsetTop ?? 0, behavior: "smooth" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load post.",
      });
    }
  };

  const handleDelete = async (meta: PostMeta) => {
    if (!password) {
      setStatus({ type: "error", message: "Enter your password before deleting posts." });
      return;
    }
    if (!window.confirm(`Delete "${meta.title}"? This cannot be undone.`)) {
      return;
    }
    setStatus({ type: "publishing" });
    try {
      await deletePost(password, meta.slug);
      setPostsList((list) => list.filter((p) => p.slug !== meta.slug));
      setStatus({
        type: "success",
        message: `Deleted "${meta.title}".`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof PostsApiError ? err.message : "Failed to delete post.",
      });
    }
  };

  const handlePublish = async () => {
    setStatus({ type: "publishing" });
    try {
      if (!password) throw new Error("Enter your password first.");

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

      const isUpdate = form.originalSlug !== null;

      // If slug changed, delete old post first
      if (form.originalSlug && form.originalSlug !== finalSlug) {
        await deletePost(password, form.originalSlug);
      }

      await savePost(password, post);

      setPostsList((list) => {
        const withoutOld = list.filter(
          (p) => p.slug !== finalSlug && p.slug !== form.originalSlug
        );
        const meta: PostMeta = {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          date: post.date,
          readTime: post.readTime,
          tags: post.tags,
        };
        return [meta, ...withoutOld].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      setStatus({
        type: "success",
        message: `${isUpdate ? "Updated" : "Published"} "${post.title}". Changes are live immediately.`,
      });
      resetForm();
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof PostsApiError
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
                Posts are saved directly to the CMS and go live immediately.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  The same password used to access this page. Stored locally for convenience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Existing posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {postsLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading posts...</span>
                  </div>
                ) : postsList.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No posts yet.</p>
                ) : (
                  postsList.map((meta) => (
                    <div
                      key={meta.slug}
                      className="flex items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{meta.title}</p>
                        <p className="text-sm text-muted-foreground">{meta.date}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => loadPostIntoForm(meta)}
                          disabled={isPublishing}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(meta)}
                          disabled={isPublishing}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

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
