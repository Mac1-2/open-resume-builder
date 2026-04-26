"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";
import {cn} from "@/lib/utils";

// Cast to any to avoid type issues with react-syntax-highlighter
const Highlighter = SyntaxHighlighter as any;

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-sm max-w-none", className)}
      components={{
        h1: ({node, ...props}) => (
          <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0" {...props} />
        ),
        h2: ({node, ...props}) => (
          <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0" {...props} />
        ),
        h3: ({node, ...props}) => (
          <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0" {...props} />
        ),
        h4: ({node, ...props}) => (
          <h4 className="text-base font-semibold mb-2 mt-3 first:mt-0" {...props} />
        ),
        p: ({node, ...props}) => (
          <p className="mb-4 last:mb-0 leading-relaxed" {...props} />
        ),
        ul: ({node, ...props}) => (
          <ul className="list-disc list-inside space-y-1 mb-4 pl-4" {...props} />
        ),
        ol: ({node, ...props}) => (
          <ol className="list-decimal list-inside space-y-1 mb-4 pl-4" {...props} />
        ),
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
         code: ({node, className, children, ...props}) => {
           const match = /language-(\w+)/.exec(className || "");
           const isInline = !match;
           return !isInline && match ? (
            <Highlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
             </Highlighter>
          ) : (
            <code
              className="bg-primary/10 text-primary px-1 py-0.5 rounded text-sm"
              {...props}
            >
              {children}
            </code>
          );
        },
        blockquote: ({node, ...props}) => (
          <blockquote
            className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4"
            {...props}
          />
        ),
        hr: ({node, ...props}) => (
          <hr className="my-6 border-border" {...props} />
        ),
        a: ({node, ...props}) => (
          <a
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}