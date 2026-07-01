import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Rendered as a named component (rather than inline) so the `p` override below
// can detect "this paragraph is just an image" and avoid nesting a <figure>
// (block content) inside a <p>.
const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => (
  <figure className="my-8 max-w-2xl mx-auto">
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-auto rounded-xl border border-border/50 shadow-soft bg-card p-2"
    />
    {alt && (
      <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
        {alt}
      </figcaption>
    )}
  </figure>
);

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={className ?? "prose prose-invert prose-lg max-w-none"}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-lg"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-secondary px-1.5 py-0.5 rounded text-accent"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-4xl font-semibold mb-6 mt-12">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mb-4 mt-10">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mb-3 mt-8">{children}</h3>
          ),
          p: ({ children, node }) => {
            // Check if paragraph contains only an image by looking at the AST node
            const hasOnlyImage =
              node?.children?.length === 1 &&
              node.children[0].type === "image";
            if (hasOnlyImage) {
              return <>{children}</>;
            }
            return (
              <p className="text-foreground/90 leading-relaxed mb-6">
                {children}
              </p>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-6 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-6 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground/90">{children}</li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-accent hover:text-accent-hover underline-offset-2 hover:underline font-medium transition-colors duration-300"
            >
              {children}
            </a>
          ),
          img: MarkdownImage,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
