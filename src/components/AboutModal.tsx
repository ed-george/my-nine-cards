import React from 'react';
import { X, Globe, ExternalLink, Heart, Database } from 'lucide-react';

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
              Created with <Heart size={15} className="heart-icon" /> by <a href="https://spght.dev" target="_blank" rel="noopener noreferrer"><strong>Ed Holloway-George</strong></a>
            </p>
            <p className="creator-desc">
              Chief-Vibe Coder
            </p>
          </div>

          <div className="about-links-group">
            <span className="links-group-label">Connect & Data</span>

            {/* X / Twitter Link */}
            <a
              href="https://x.com/ptcgenius"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-item"
            >
              <div className="link-left">
                <span className="x-logo-icon">𝕏</span>
                <div className="link-text-stack">
                  <span className="link-title">Follow on X</span>
                  <span className="link-handle">@ptcgenius</span>
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

            {/* TCGdex Link */}
            <a
              href="https://tcgdex.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-item"
            >
              <div className="link-left">
                <Database size={18} className="tcgdex-icon" />
                <div className="link-text-stack">
                  <span className="link-title">Powered by TCGdex</span>
                  <span className="link-handle">tcgdex.dev</span>
                </div>
              </div>
              <ExternalLink size={16} className="external-icon" />
            </a>
          </div>

          <span className="links-group-label">Copyright Notice</span>

          {/* Pokémon TCG Copyright Disclaimer */}
          <div className="about-disclaimer-box">
            <p className="disclaimer-text">
              The content on this website surrounding the Pokémon Trading Card Game and Pokémon Trading Card Game Pocket, including but not limited to card images and text, is copyright The Pokémon Company (Pokémon), Nintendo, DeNA, Game Freak and/or Creatures Inc. This website is fan made and not produced by, endorsed by, supported by, or affiliated with Pokémon, Nintendo, Game Freak, Creatures or any afformentioned entities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
