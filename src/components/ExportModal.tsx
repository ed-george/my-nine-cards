import React, { useState } from 'react';
import { Download, Copy, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { downloadGridImage, copyGridImageToClipboard } from '../services/exportCanvas';

interface ExportModalProps {
  isOpen: boolean;
  exportRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  exportRef,
  title,
  onClose,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'png' | 'jpeg' | null>(null);
  const [copiedImage, setCopiedImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async (format: 'png' | 'jpeg') => {
    if (!exportRef.current) return;
    setDownloadingFormat(format);
    setErrorMessage(null);

    const safeTitle = (title || 'my-9-cards')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const fileName = `${safeTitle}.${format}`;

    try {
      await downloadGridImage(exportRef.current, format, fileName);
    } catch (err) {
      setErrorMessage('Failed to generate image download. Please try copying to clipboard.');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleCopyClipboard = async () => {
    if (!exportRef.current) return;
    setErrorMessage(null);
    const success = await copyGridImageToClipboard(exportRef.current);
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } else {
      setErrorMessage('Browser blocked image clipboard copy. Try downloading PNG instead.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="export-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Export Showcase Image</h3>
            <p className="modal-subtitle">Save high-resolution image to post on Twitter/X, Instagram, or Reddit</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close export modal">
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="export-actions-grid">
          {/* Download PNG */}
          <button
            className="export-card-btn primary"
            disabled={downloadingFormat !== null}
            onClick={() => handleDownload('png')}
          >
            {downloadingFormat === 'png' ? (
              <Loader2 className="spinner-icon" size={24} />
            ) : (
              <Download size={24} />
            )}
            <div className="btn-label-group">
              <span className="main-label">Download PNG Image</span>
              <span className="sub-label">High-resolution image</span>
            </div>
          </button>

          {/* Copy to Clipboard */}
          <button
            className="export-card-btn secondary"
            onClick={handleCopyClipboard}
          >
            {copiedImage ? <Check size={24} className="text-green-600" /> : <Copy size={24} />}
            <div className="btn-label-group">
              <span className="main-label">{copiedImage ? 'Image Copied!' : 'Copy Image to Clipboard'}</span>
              <span className="sub-label">Paste directly into Discord/X/etc</span>
            </div>
          </button>

          {/* Download JPEG */}
          <button
            className="export-card-btn secondary"
            disabled={downloadingFormat !== null}
            onClick={() => handleDownload('jpeg')}
          >
            {downloadingFormat === 'jpeg' ? (
              <Loader2 className="spinner-icon" size={24} />
            ) : (
              <ImageIcon size={24} />
            )}
            <div className="btn-label-group">
              <span className="main-label">Download JPEG Image</span>
              <span className="sub-label">Smaller file size for mobile sharing</span>
            </div>
          </button>
        </div>

        {errorMessage && (
          <div className="export-error-notice">
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
