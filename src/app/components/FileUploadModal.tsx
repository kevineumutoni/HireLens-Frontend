// src/app/components/FileUploadModal.tsx
"use client";

import { useMemo, useState } from "react";
import { uploadCandidatesApi } from "@/app/lib/api";
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const BRAND = "#2C7CF2";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function isAllowedFile(file: File) {
  const name = file.name.toLowerCase();
  const extOk = name.endsWith(".csv") || name.endsWith(".pdf");
  const typeOk =
    file.type === "text/csv" ||
    file.type === "application/pdf" ||
    file.type === "application/vnd.ms-excel"; // some browsers for csv
  return extOk || typeOk;
}

export function FileUploadModal({ isOpen, onClose, onSuccess }: FileUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const fileLabel = useMemo(() => file?.name ?? "Click to upload CSV or PDF", [file]);

  const close = () => {
    setFile(null);
    setUploadResult(null);
    onClose();
  };

  const onPickFile = (f: File | null) => {
    setUploadResult(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (!isAllowedFile(f)) {
      toast.error("Only CSV and PDF files are allowed");
      setFile(null);
      return;
    }
    if (f.size <= 0) {
      toast.error("File is empty");
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadCandidatesApi(file);
      setUploadResult(result);
      toast.success(`${result.uploaded_count ?? 0} candidates uploaded successfully!`);

      onSuccess();

      // close quickly, not 2 seconds (feels broken otherwise)
      setTimeout(() => {
        close();
      }, 600);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Upload candidates</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-600" type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          className="rounded-2xl border-2 border-dashed p-6 text-center"
          style={{ borderColor: "#BFD8FF", background: "#F5F9FF" }}
        >
          <Upload className="mx-auto mb-2 h-8 w-8" style={{ color: BRAND }} />

          <label className="cursor-pointer">
            <span className="block text-sm font-semibold text-slate-900">{fileLabel}</span>
            <span className="mt-1 block text-xs text-slate-600">Supported: CSV, PDF</span>

            <input
              type="file"
              accept=".csv,.pdf"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {uploadResult && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <CheckCircle className="h-4 w-4" style={{ color: BRAND }} />
              <span>{uploadResult.uploaded_count ?? 0} uploaded</span>
            </div>

            {(uploadResult.failed_count ?? 0) > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <AlertCircle className="h-4 w-4 text-slate-500" />
                <span>{uploadResult.failed_count} failed</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onUpload}
            disabled={uploading || !file}
            className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: BRAND }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}