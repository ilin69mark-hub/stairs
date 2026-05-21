"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface StrapiContentProps {
  endpoint: string;
}

interface StrapiResponse {
  data: {
    attributes: {
      content: string;
      title?: string;
    };
  };
}

export function StrapiContent({ endpoint }: StrapiContentProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_URL}/api/cms/${endpoint}`);

        if (!res.ok) {
          throw new Error("Failed to fetch content");
        }

        const data: StrapiResponse = await res.json();
        setContent(data.data?.attributes?.content || "");
      } catch (err) {
        setError("Failed to load content");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [endpoint]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}