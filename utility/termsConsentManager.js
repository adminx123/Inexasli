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
    const htmlContent = `
      <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
        <h2 style="font-size: 1.2rem; color: #333; margin-top: 0; margin-bottom: 15px; font-family: 'Geist', sans-serif;">Terms of Service & Data Consent</h2>
        <div class="terms-section">
          <div style="margin-bottom:15px; text-align: left;">
            <span style="font-size:13px;margin-bottom:2px;">Please accept our <a href="#" id="view-terms-link" style="display:inline;">Terms of Service</a> to use our services.</span><br>
            <span style="font-size:12px;color:#666;display:block;margin-top:2px;">(last updated: ${LAST_UPDATED_DATE})</span>
          </div>
          <label style="display:block;margin-bottom:15px;font-size:13px;color:#222;text-align:left;cursor:pointer;user-select:none;">
            <input type="checkbox" id="accept-terms" style="margin-right:8px;accent-color:#4a7c59;"> I have read and accept the Terms of Service
          </label>
        </div>
        <div class="consent-section">
          <p style="font-size:13px;margin-bottom:15px;text-align:left;line-height:1.5;color:#666;">Please consent to the storage and processing of your data as described in our terms.</p>
          <label style="display:block;margin-bottom:15px;font-size:13px;color:#222;text-align:left;cursor:pointer;user-select:none;">
            <input type="checkbox" id="accept-consent" style="margin-right:8px;accent-color:#4a7c59;"> I consent to data storage and processing
          </label>
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 18px;">
          <button id="accept-both" disabled>Accept & Continue</button>
        </div>
      </div>
    `;

    const modal = window.openCustomModal(htmlContent, {
      maxWidth: '400px',
      onOpen: (modal, modalContent) => {
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
          window.closeModal();
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
            window.openModal('/legal.txt');
          } else {
            window.open('/legal.txt', '_blank');
          }
        };
      }
    });
  }

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
