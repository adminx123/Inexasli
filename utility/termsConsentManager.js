/*
 * termsConsentManager.js - Unified Terms & Data Consent Modal (checkbox version)
 * 
 * FEATURES:
 * • Shows modal with two checkboxes for terms and consent
 * • Validates user consent against TOS last updated date
 * • Forces re-acceptance if TOS updated after user's last consent
 * • Single source of truth for TOS versioning
 * 
 * TOS UPDATE WORKFLOW:
 * • Change TOS_LAST_UPDATED date below
 * • Users with older consent will be re-prompted
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
  
  // AUTO-UPDATE-HELPER: Change this date when updating Terms of Service
  const TOS_LAST_UPDATED = "2025-07-04T16:19:01.000Z"; // ISO format for comparison

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

  // Get TOS display date (formatted for UI)
  function getTOSDisplayDate() {
    return new Date(TOS_LAST_UPDATED).toLocaleDateString();
  }

  // Check if user's consent is still valid (not outdated by TOS updates)
  function isConsentValid() {
    const status = loadStatus();
    
    // Must have both terms accepted and consent given with acceptance date
    if (!status.termsAccepted || !status.consentGiven || !status.acceptedDate) {
      return false;
    }
    
    // Compare user's acceptance date with last TOS update
    const userAcceptedDate = new Date(status.acceptedDate);
    const lastUpdatedDate = new Date(TOS_LAST_UPDATED);
    
    // If user accepted before TOS was last updated, consent is invalid
    if (userAcceptedDate < lastUpdatedDate) {
      console.log('[TermsConsentManager] Consent invalidated - TOS updated after user acceptance');
      return false;
    }
    
    return true;
  }

  // Show unified modal
  async function showUnifiedModal() {
    // Check if user had previous consent that's now outdated
    const status = loadStatus();
    const isReturningUser = status.acceptedDate && new Date(status.acceptedDate) < new Date(TOS_LAST_UPDATED);
    
    const updateNotice = isReturningUser 
      ? `<div style="margin-bottom:15px;padding:8px;background-color:#fff3cd;border:1px solid #ffeaa7;border-radius:4px;color:#856404;font-size:12px;text-align:center;">
           <strong>Updated Terms:</strong> Our Terms of Service and consent requirements have been updated. Please review and re-accept to continue.
         </div>`
      : '';
    
    const htmlContent = `
      <div style="text-align: center; font-family: 'Inter', sans-serif; width: 100%;">
        <h2 style="font-size: 1.2rem; color: #333; margin-top: 0; margin-bottom: 15px; font-family: 'Geist', sans-serif;">Terms of Service & Data Consent</h2>
        ${updateNotice}
        <div class="terms-section">
          <div style="margin-bottom:15px; text-align: left;">
            <span style="font-size:13px;margin-bottom:2px;">Please accept our <a href="#" id="view-terms-link" style="display:inline;">Terms of Service</a> to use our services.</span>
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
          <button id="decline-terms" style="background: rgba(75, 85, 99, 0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 12px 20px; font-size: 1em; cursor: pointer; font-weight: bold; font-family: 'Geist', sans-serif; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(75, 85, 99, 0.15);">Decline</button>
          <button id="accept-both" disabled>Accept & Continue</button>
        </div>
      </div>
    `;

    const modal = window.openCustomModal(htmlContent, {
      maxWidth: '400px',
      dismissible: false, // Prevent closing by clicking outside or pressing escape
      onOpen: (modal, modalContent) => {
        // Enable button only if both boxes checked
        const btn = modal.querySelector('#accept-both');
        const declineBtn = modal.querySelector('#decline-terms');
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
        
        // Decline handler
        declineBtn.onclick = function() {
          // Save declined status
          saveStatus({
            termsAccepted: false,
            consentGiven: false,
            declinedDate: new Date().toISOString()
          });
          window.closeModal();
          // Optionally show a message about limited functionality
          alert('You have declined the terms. You will not be able to use the services until you accept the terms and consent.');
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

  // Expose for debugging and external triggering
  window.termsConsentManager = {
    show: showUnifiedModal,
    saveStatus,
    loadStatus,
    checkStatus: isConsentValid,
    
    // TOS Version Control API
    getTOSLastUpdated: () => TOS_LAST_UPDATED,
    getTOSDisplayDate: getTOSDisplayDate,
    isConsentValid: isConsentValid,
    
    // Constants for other modules
    TOS_LAST_UPDATED: TOS_LAST_UPDATED
  };

  // Also expose globally for compatibility
  window.TOS_LAST_UPDATED = TOS_LAST_UPDATED;
})();
