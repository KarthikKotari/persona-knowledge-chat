"use client";

import { useEffect, useState } from "react";
import KBViewer from "@/components/KBViewer";
import { DocumentMeta } from "@/lib/types";

export default function KBPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body.error ?? `Request failed with status ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data: { documents: DocumentMeta[] }) => {
        setDocuments(data.documents);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load documents.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return <KBViewer documents={documents} loading={loading} error={error} />;
}
