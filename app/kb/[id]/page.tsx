"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DocumentMeta } from "@/lib/types";

interface DocumentDetail extends DocumentMeta {
  content: string;
}

export default function KBDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetch(`/api/documents/${encodeURIComponent(id)}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(
              body.error ?? `Request failed with status ${res.status}`,
            );
          });
        }
        return res.json();
      })
      .then((data: DocumentDetail | null) => {
        if (data) {
          setDocument(data);
        }
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load document.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div
        className="kb-viewer__state"
        aria-label="Loading document"
        aria-busy="true"
      >
        <span className="kb-viewer__spinner" aria-hidden="true" />
        <span>Loading document…</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="kb-viewer__state kb-viewer__state--empty">
        <p className="kb-viewer__empty-title">Document not found</p>
        <p className="kb-viewer__empty-description">
          The document you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/kb" className="kb-doc__back-link">
          ← Back to Knowledge Base
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="kb-viewer__state kb-viewer__state--error"
        role="alert"
      >
        <strong>Error:</strong> {error}
        <Link href="/kb" className="kb-doc__back-link">
          ← Back to Knowledge Base
        </Link>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <article className="kb-doc">
      <nav className="kb-doc__nav" aria-label="Breadcrumb">
        <Link href="/kb" className="kb-doc__back-link">
          ← Back to Knowledge Base
        </Link>
      </nav>
      <header className="kb-doc__header">
        <h1 className="kb-doc__title">{document.title}</h1>
        <span className="kb-doc__filename">{document.filename}</span>
      </header>
      <section className="kb-doc__content" aria-label="Document content">
        <pre className="kb-doc__pre">{document.content}</pre>
      </section>
    </article>
  );
}
