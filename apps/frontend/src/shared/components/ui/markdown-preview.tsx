import { useEffect, useState } from "react";
import { marked } from "marked";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        const parsed = await marked.parse(content);
        setHtmlContent(parsed);
      } catch (err) {
        console.error("Failed to parse markdown:", err);
        setHtmlContent(content);
      }
    };

    parseMarkdown();
  }, [content]);

  return (
    <div
      className={`prose prose-sm prose-invert max-w-none text-xs text-muted-foreground leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default MarkdownPreview;
