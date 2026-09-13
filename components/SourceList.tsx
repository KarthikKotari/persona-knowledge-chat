import { SourceRef } from "@/lib/types";

interface SourceListProps {
  sources: SourceRef[];
}

export default function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="source-list">
      <span className="source-list__label">Sources</span>
      <ul className="source-list__items">
        {sources.map((source, index) => (
          <li key={index} className="source-list__item">
            <span className="source-list__title">{source.title}</span>
            <span className="source-list__filename">{source.filename}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
