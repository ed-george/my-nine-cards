import React from 'react';
import { X, Globe, ExternalLink, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="about-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="about-title-group">
            <h3 className="modal-title">About My 9 Cards</h3>
            <p className="modal-subtitle">Pokémon TCG Showcase Grid Builder</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close info">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="about-modal-body">
          <div className="creator-info-card">
            <p className="creator-text">
              Created with <Heart size={15} className="heart-icon" /> by <strong>Ed Holloway-George</strong>.
            </p>
            <p className="creator-desc">
              Build and customize 3x3 grids of your favourite Pokémon cards using the TCGdex REST API, then export high-resolution images to share with the community.
            </p>
          </div>

          <div className="about-links-group">
            <span className="links-group-label">Connect & Links</span>

            {/* X / Twitter Link */}
            <a
              href="https://x.com/ptgenius"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-item"
            >
              <div className="link-left">
                <span className="x-logo-icon">𝕏</span>
                <div className="link-text-stack">
                  <span className="link-title">Follow on X</span>
                  <span className="link-handle">@ptgenius</span>
                </div>
              </div>
              <ExternalLink size={16} className="external-icon" />
            </a>

            {/* Personal Website Link */}
            <a
              href="https://spght.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-item"
            >
              <div className="link-left">
                <Globe size={18} className="globe-icon" />
                <div className="link-text-stack">
                  <span className="link-title">Personal Website</span>
                  <span className="link-handle">spght.dev</span>
                </div>
              </div>
              <ExternalLink size={16} className="external-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
