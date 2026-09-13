import Link from "next/link";
import { DocumentMeta } from "@/lib/types";

interface KBViewerProps {
  documents: DocumentMeta[];
  loading: boolean;
  error: string | null;
}

export default function KBViewer({ documents, loading, error }: KBViewerProps) {
  if (loading) {
    return (
      <div className="kb-viewer__state" aria-label="Loading documents" aria-busy="true">
        <span className="kb-viewer__spinner" aria-hidden="true" />
        <span>Loading documents…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kb-viewer__state kb-viewer__state--error" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="kb-viewer__state kb-viewer__state--empty">
        <p className="kb-viewer__empty-title">No documents found</p>
        <p className="kb-viewer__empty-description">
          Run <code>npm run seed</code> to ingest the knowledge base documents.
        </p>
      </div>
    );
  }

  return (
    <ul className="kb-viewer__list" aria-label="Knowledge base documents">
      {documents.map((doc) => (
        <li key={doc.id} className="kb-viewer__item">
          <Link href={`/kb/${doc.id}`} className="kb-viewer__link">
            <span className="kb-viewer__doc-title">{doc.title}</span>
            <span className="kb-viewer__doc-filename">{doc.filename}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
