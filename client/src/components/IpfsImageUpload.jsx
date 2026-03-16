import React, { useState, useRef } from 'react';
import { uploadImageToPinata, isPinataConfigured } from '../utils/pinata';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_MB = 10;

/**
 * IpfsImageUpload
 * Uploads an image to IPFS via Pinata and calls onChange with `ipfs://<CID>`.
 * If Pinata is not configured it falls back to a plain URL input.
 */
const IpfsImageUpload = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  const pinataReady = isPinataConfigured();

  // ── Resolve preview URL ────────────────────────────────────────────────────
  const resolvedPreview = preview || (value?.startsWith('ipfs://')
    ? `https://gateway.pinata.cloud/ipfs/${value.replace('ipfs://', '')}`
    : value) || '';

  // ── Handle file ────────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Please use JPG, PNG, GIF, WebP or SVG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploadError('');
    setIsUploading(true);

    try {
      const cid = await uploadImageToPinata(file);
      onChange(`ipfs://${cid}`);
    } catch (err) {
      console.error('Pinata upload failed:', err);
      setUploadError('Upload failed. Check your Pinata API keys and try again.');
      setPreview('');
      onChange('');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── Fallback: plain URL input ─────────────────────────────────────────────
  if (!pinataReady) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="url"
          placeholder="Paste image URL here (Pinata keys not configured)"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="py-[15px] sm:px-[25px] px-[15px] outline-none border border-[#374151] bg-[#1F2937]/50 font-epilogue text-white text-[14px] placeholder:text-[#9CA3AF] rounded-xl focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all duration-300 w-full"
        />
        <p className="text-[11px] text-[#F59E0B] font-epilogue">
          ⚠ Add VITE_PINATA_API_KEY & VITE_PINATA_SECRET_API_KEY to .env to enable IPFS uploads.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full min-h-[180px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden
          ${isDragging
            ? 'border-[#6366F1] bg-[#6366F1]/10 scale-[1.01]'
            : 'border-[#374151] bg-[#1F2937]/40 hover:border-[#6366F1]/60 hover:bg-[#1F2937]/70'
          }
          ${isUploading ? 'cursor-wait' : ''}`}
      >
        {/* Background preview */}
        {resolvedPreview && !isUploading && (
          <img
            src={resolvedPreview}
            alt="Campaign preview"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center pointer-events-none">
          {isUploading ? (
            <>
              {/* Spinner */}
              <div className="w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
              <p className="font-epilogue text-[14px] text-[#9CA3AF]">Uploading to IPFS…</p>
            </>
          ) : resolvedPreview ? (
            <>
              <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-epilogue text-[14px] text-[#10B981] font-semibold">Uploaded to IPFS ✓</p>
              <p className="font-epilogue text-[11px] text-[#9CA3AF]">Click or drag to replace</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#374151] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-epilogue font-semibold text-[14px] text-white">
                  Drag & drop or <span className="text-[#6366F1]">browse</span>
                </p>
                <p className="font-epilogue text-[12px] text-[#9CA3AF] mt-1">
                  JPG, PNG, GIF, WebP, SVG · Max {MAX_SIZE_MB} MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CID display */}
      {value?.startsWith('ipfs://') && !isUploading && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#10B981]/5 border border-[#10B981]/20 rounded-lg">
          <svg className="w-4 h-4 text-[#10B981] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14.828 14.828a4 4 0 015.656 0l-4 4a4 4 0 01-5.656-5.656l1.1-1.1" />
          </svg>
          <p className="font-epilogue text-[11px] text-[#10B981] truncate">{value}</p>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="font-epilogue text-[12px] text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  );
};

export default IpfsImageUpload;
