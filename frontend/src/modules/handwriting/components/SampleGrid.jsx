import SampleCard from "./SampleCard";
import EmptyState from "../../dashboard/components/EmptyState";
import { Image as ImageIcon } from "lucide-react";

export default function SampleGrid({
  samples = [],
  onZoom,
  onReplace,
  onDelete,
  replacingSampleId,
}) {
  if (samples.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No handwriting samples uploaded yet."
        description="Upload sheets of your handwriting to train your personal profile."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {samples.map((sample) => (
        <SampleCard
          key={sample.sampleId}
          sample={sample}
          onZoom={onZoom}
          onReplace={onReplace}
          onDelete={onDelete}
          replacingSampleId={replacingSampleId}
        />
      ))}
    </div>
  );
}
