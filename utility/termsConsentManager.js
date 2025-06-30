/*
 * termsConsentManager.js - Unified Terms & Data Consent Modal (checkbox version)
 * Combines terms of service and data consent into a single modal.
 * User must check both boxes to continue. Styled like the original modals.
 */
(function() {
  // Load legal modal functionality
  async function loadLegalModule() {
    if (!window.openLegalModal) {
      try {
        await import('/utility/legal.js');
        console.log('[TermsConsentManager] Legal module loaded successfully');
      } catch (error) {
        console.warn('[TermsConsentManager] Failed to load legal module:', error);
      }
    }
  }
  
  // Load legal module immediately
  loadLegalModule();

  const STORAGE_KEY = 'userLegalStatus';
  const COOKIE_NAME = 'user_legal_status';
  const EXPIRY_DAYS = 365;
  const TERMS_FILE_PATH = '/legal.txt';
  const LAST_UPDATED_DATE = 'June 22, 2025';

  // Utility: Set cookie
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }
  // Utility: Get cookie
  function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  }
  // Utility: Save status
  function saveStatus(status) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    setCookie(COOKIE_NAME, JSON.stringify(status), EXPIRY_DAYS);
  }
  // Utility: Load status
  function loadStatus() {
    let status = {};
    try {
      status = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {}
    if (!status.termsAccepted || !status.consentGiven) {
      try {
        status = JSON.parse(getCookie(COOKIE_NAME) || '{}');
      } catch {}
    }
    return status;
  }

  // Utility: Fetch terms text
  async function fetchTerms() {
    const res = await fetch(TERMS_FILE_PATH);
    return await res.text();
  }

  // Show unified modal
  async function showUnifiedModal() {
    const modal = document.createElement('div');
    modal.className = 'terms-consent-overlay';
    modal.innerHTML = `
      <div class="terms-consent-modal">
        <h2>Terms of Service & Data Consent</h2>
        <div class="terms-section">
          <div class="modal-align" style="margin-bottom:15px;">
            <span style="font-size:13px;margin-bottom:2px;">Please accept our <a href="#" id="view-terms-link" style="display:inline;">Terms of Service</a> to use our services.</span><br>
            <span style="font-size:12px;color:#666;display:block;margin-top:2px;">(last updated: ${LAST_UPDATED_DATE})</span>
          </div>
          <label class="modal-align modal-label" style="display:block;margin-bottom:15px;">
            <input type="checkbox" id="accept-terms"> I have read and accept the Terms of Service
          </label>
        </div>
        <div class="consent-section">
          <p class="modal-align" style="font-size:13px;margin-bottom:15px;">Please consent to the storage and processing of your data as described in our terms.</p>
          <label class="modal-align modal-label" style="display:block;margin-bottom:15px;">
            <input type="checkbox" id="accept-consent"> I consent to data storage and processing
          </label>
        </div>
        <div class="modal-buttons modal-align">
          <button id="accept-both" disabled>Accept & Continue</button>
        </div>
      </div>
    `;
    // Only block pointer events on the overlay, not the whole body
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '1000000';
    document.body.appendChild(modal);
    // Remove global pointer-events: none
    document.body.classList.add('terms-consent-modal-active');
    // Enable button only if both boxes checked
    const btn = modal.querySelector('#accept-both');
    const box1 = modal.querySelector('#accept-terms');
    const box2 = modal.querySelector('#accept-consent');
    function updateBtn() {
      btn.disabled = !(box1.checked && box2.checked);
    }
    box1.addEventListener('change', updateBtn);
    box2.addEventListener('change', updateBtn);
    // Accept handler
    btn.onclick = function() {
      saveStatus({
        termsAccepted: true,
        consentGiven: true,
        acceptedDate: new Date().toISOString()
      });
      document.body.classList.remove('terms-consent-modal-active');
      modal.remove();
    };
    // View full terms link
    modal.querySelector('#view-terms-link').onclick = function(e) {
      e.preventDefault();
      // Try to use the legal modal first
      if (typeof window.openLegalModal === 'function') {
        window.openLegalModal();
      } else if (typeof window.openTermsOfService === 'function') {
        window.openTermsOfService();
      } else if (typeof window.showTermsOfService === 'function') {
        window.showTermsOfService();
      } else if (typeof window.showLegal === 'function') {
        window.showLegal();
      } else if (typeof window.openModal === 'function') {
        // Use a higher z-index for the modal.js modal as fallback
        setTimeout(() => {
          const modalEls = document.querySelectorAll('.modal');
          modalEls.forEach(m => m.style.zIndex = '1000001');
        }, 10);
        window.openModal('/legal.txt');
      } else {
        window.open('/legal.txt', '_blank');
      }
    };
  }

  // CSS (no global pointer-events)
  const style = document.createElement('style');
  style.textContent = `
    .terms-consent-overlay {
      position: fixed; top:0; left:0; width:100vw; height:100vh;
      background: rgba(0,0,0,0.7); 
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000000;
      display: flex; align-items: center; justify-content: center;
      font-family: "Inter", sans-serif;
      pointer-events: auto;
    }
    .terms-consent-modal {
      background-color: rgba(242, 249, 243, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(74, 124, 89, 0.12), 0 4px 16px rgba(74, 124, 89, 0.08), 0 1px 4px rgba(74, 124, 89, 0.04);
      max-width: 400px;
      width: 90%;
      text-align: center;
      font-family: "Inter", sans-serif;
      position: relative;
      z-index: 1000001;
      pointer-events: auto;
      transform: scale(0.95);
      transition: all 0.3s ease;
    }
    .terms-consent-modal h2 {
      font-size: 1.2rem;
      color: #333;
      margin-top: 0;
      margin-bottom: 15px;
      font-family: "Geist", sans-serif;
      text-align: center;
    }
    .terms-consent-modal p {
      font-size: 13px;
      line-height: 1.5;
      color: #666;
      margin-bottom: 15px;
      text-align: left;
    }
    .terms-consent-modal label {
      font-size: 13px;
      color: #222;
      margin-bottom: 0;
      cursor: pointer;
      user-select: none;
      text-align: left;
      display: block;
    }
    .terms-consent-modal input[type="checkbox"] {
      margin-right: 8px;
      accent-color: #4a7c59;
    }
    .modal-buttons { display: flex; justify-content: center; gap: 10px; margin-top: 18px; }
    .modal-buttons button { 
      background: rgba(45, 90, 61, 0.9); 
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #fff; 
      border: 1px solid rgba(255, 255, 255, 0.2); 
      border-radius: 12px; 
      padding: 12px 20px; 
      font-size: 1em; 
      cursor: pointer; 
      font-weight: bold;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(45, 90, 61, 0.15);
    }
    .modal-buttons button:disabled { 
      background: rgba(178, 178, 178, 0.7); 
      cursor: not-allowed;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;
    }
    .modal-buttons button:hover:enabled { 
      background: rgba(74, 124, 89, 0.95);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(45, 90, 61, 0.2);
    }
    
    @media (max-width: 480px) {
      .terms-consent-modal {
        padding: 15px;
        width: 90%;
        max-width: 300px;
      }
      .terms-consent-modal h2 {
        font-size: 1.1rem;
      }
      .terms-consent-modal p {
        font-size: 12px;
      }
      .terms-consent-modal label {
        font-size: 12px;
      }
      .modal-buttons button {
        padding: 8px 14px;
        font-size: 0.9em;
      }
    }
  `;
  document.head.appendChild(style);

  // No longer show modal automatically on page load
  // Modal will be triggered by datain.js when container expands

  // DEBUG: Force modal to show for testing
  // localStorage.removeItem(STORAGE_KEY);
  // setCookie(COOKIE_NAME, '', -1);

  // Expose for debugging and external triggering
  window.termsConsentManager = {
    show: showUnifiedModal,
    saveStatus,
    loadStatus,
    checkStatus: () => {
      const status = loadStatus();
      return status.termsAccepted && status.consentGiven;
    }
  };
})();
