import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, Upload } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function StudyMaterialsStatus({ studyMaterials }) {
  const navigate = useNavigate();
  const count = studyMaterials?.count || 0;
  const recent = studyMaterials?.recent?.[0];

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-paper-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-ink-900">Study Materials</h3>
        </div>

        <span className="rounded-full bg-paper-100 px-2.5 py-0.5 text-xs font-semibold text-ink-800">
          {count} {count === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="mt-4">
        {count === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-700 leading-relaxed">
              No study materials uploaded yet. Upload syllabus notes or reference PDFs for AI text extraction.
            </p>
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              onClick={() => navigate("/materials")}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5 inline" />
              Upload Material
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-medium text-ink-700">
              {count} {count === 1 ? "material" : "materials"} uploaded
            </p>

            {recent ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-paper-100 bg-paper-50/70 p-2.5">
                <FileText className="h-4 w-4 flex-shrink-0 text-terracotta-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink-900">
                    Recent: {recent.title}
                  </p>
                </div>
              </div>
            ) : null}

            <Button
              variant="secondary"
              fullWidth
              size="sm"
              onClick={() => navigate("/materials")}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5 inline" />
              Upload Material
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
