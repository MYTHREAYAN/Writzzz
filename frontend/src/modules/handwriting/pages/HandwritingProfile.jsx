import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getHandwritingProfile,
  saveHandwritingProfile,
  uploadHandwritingSample,
  replaceHandwritingSample,
  deleteHandwritingSample,
} from "../services/handwritingService";
import HandwritingProfileHeader from "../components/HandwritingProfileHeader";
import ProfileStatus from "../components/ProfileStatus";
import StyleSelector from "../components/StyleSelector";
import UploadInstructions from "../components/UploadInstructions";
import SampleUploader from "../components/SampleUploader";
import SampleGrid from "../components/SampleGrid";
import HandwritingPreview from "../components/HandwritingPreview";
import DeleteSampleModal from "../components/DeleteSampleModal";
import ImagePreviewModal from "../components/ImagePreviewModal";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { APP_ROUTES } from "../../../constants/routes";
import { Save, CheckCircle2, RefreshCw } from "lucide-react";

export default function HandwritingProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("Running Letter");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacingSampleId, setReplacingSampleId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalSample, setDeleteModalSample] = useState(null);
  const [zoomModalSample, setZoomModalSample] = useState(null);

  const [serverError, setServerError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  function showToast(msg) {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  }

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setServerError("");
    try {
      const response = await getHandwritingProfile();
      setProfile(response.data);
      if (response.data?.selectedStyle) {
        setSelectedStyle(response.data.selectedStyle);
      }
    } catch (err) {
      if (err.status === 401) {
        await logout();
        navigate(APP_ROUTES.login, { replace: true });
        return;
      }
      setServerError(err.message || "Unable to load handwriting profile.");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  async function handleSaveProfile() {
    setSaving(true);
    setServerError("");
    try {
      const response = await saveHandwritingProfile({ selectedStyle });
      setProfile(response.data);
      showToast("Handwriting profile saved successfully!");
    } catch (err) {
      setServerError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadSample(file) {
    setUploading(true);
    setServerError("");
    try {
      const response = await uploadHandwritingSample(file);
      setProfile(response.data.profile);
      showToast("Handwriting sample uploaded successfully!");
    } catch (err) {
      setServerError(err.message || "Sample upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleReplaceSample(sampleId, file) {
    setReplacingSampleId(sampleId);
    setServerError("");
    try {
      const response = await replaceHandwritingSample(sampleId, file);
      setProfile(response.data.profile);
      showToast("Handwriting sample replaced successfully!");
    } catch (err) {
      setServerError(err.message || "Failed to replace sample.");
    } finally {
      setReplacingSampleId(null);
    }
  }

  async function handleDeleteConfirm(sampleId) {
    setDeleting(true);
    setServerError("");
    try {
      const response = await deleteHandwritingSample(sampleId);
      setProfile(response.data);
      setDeleteModalSample(null);
      showToast("Handwriting sample deleted.");
    } catch (err) {
      setServerError(err.message || "Failed to delete sample.");
    } finally {
      setDeleting(false);
    }
  }

  const sampleCount = profile?.samples ? profile.samples.length : 0;
  const status = profile?.status || "NOT_CREATED";

  return (
    <div className="min-h-screen bg-paper-50/60 text-ink-800 antialiased font-sans">
      <HandwritingProfileHeader user={user} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Alert Feedback */}
        {successToast ? (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all animate-bounce">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-ink-700">Loading handwriting profile...</p>
          </div>
        ) : (
          <>
            {serverError ? (
              <Alert type="error" className="mb-4">
                {serverError}
              </Alert>
            ) : null}

            {/* Profile Status Overview */}
            <ProfileStatus
              status={status}
              selectedStyle={selectedStyle}
              sampleCount={sampleCount}
            />

            {/* Style Selection Cards */}
            <div className="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm sm:p-8">
              <StyleSelector
                selectedStyle={selectedStyle}
                onSelectStyle={(style) => setSelectedStyle(style)}
              />
            </div>

            {/* Upload & Guidelines Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-ink-900">Upload Handwriting Sheet</h3>
                <SampleUploader
                  onUpload={handleUploadSample}
                  uploading={uploading}
                  sampleCount={sampleCount}
                  maxSamples={10}
                />
              </div>

              <UploadInstructions />
            </div>

            {/* Uploaded Samples Section */}
            <section className="rounded-2xl border border-paper-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-paper-100 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-ink-900">Uploaded Handwriting Samples</h3>
                  <p className="text-xs text-ink-700">
                    Manage sample sheets used for font synthesis ({sampleCount} of 10 slots filled).
                  </p>
                </div>
              </div>

              <SampleGrid
                samples={profile?.samples || []}
                onZoom={(sample) => setZoomModalSample(sample)}
                onReplace={handleReplaceSample}
                onDelete={(sample) => setDeleteModalSample(sample)}
                replacingSampleId={replacingSampleId}
              />
            </section>

            {/* Handwriting Style Preview */}
            <HandwritingPreview
              selectedStyle={selectedStyle}
              hasSamples={sampleCount > 0}
            />

            {/* Bottom Save Action Bar */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-paper-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
              <div className="text-xs text-ink-700">
                <span>Selected style: </span>
                <span className="font-semibold text-ink-900">{selectedStyle}</span>
              </div>

              <Button onClick={handleSaveProfile} loading={saving}>
                <Save className="mr-1.5 h-4 w-4 inline" />
                Save Handwriting Profile
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <DeleteSampleModal
        sample={deleteModalSample}
        isOpen={Boolean(deleteModalSample)}
        onClose={() => setDeleteModalSample(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      <ImagePreviewModal
        sample={zoomModalSample}
        isOpen={Boolean(zoomModalSample)}
        onClose={() => setZoomModalSample(null)}
      />
    </div>
  );
}
