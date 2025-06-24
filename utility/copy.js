// /*
//  * Copyright (c) 2025 INEXASLI. All rights reserved.
//  * This code is protected under Canadian and international copyright laws.
//  * Unauthorized use, reproduction, distribution, or modification of this code 
//  * without explicit written permission via email from info@inexasli.com 
//  * is strictly prohibited. Violators will be pursued and prosecuted to the 
//  * fullest extent of the law in British Columbia, Canada, and applicable 
//  * jurisdictions worldwide.
//  */

/**
 * Copy utility - Creates a copy button in the bottom right corner
 * that copies content to the clipboard
 */

/**
 * Create and display a floating copy button in the bottom right corner
 * @param {string} containerId - ID of the container element (where content will be copied from)
 * @param {Function} getContentCallback - Optional callback function to get specific content
 * @returns {HTMLElement} - The created button
 */
function createCopyButton(containerId, getContentCallback) {
    // Button is now integrated into datain.js - skip external creation
    console.log('[Copy] Button creation skipped - integrated into datain.js');
    return;
    
    // Create the button with the 3D styling
    const button = document.createElement('button');
    button.id = 'copyButton';
    button.title = 'Copy to clipboard';
    
    // Apply styling for bottom right corner - borderless
    button.style.backgroundColor = 'transparent';
    button.style.color = '#000';
    button.style.border = 'none';
    button.style.borderRadius = '0';
    button.style.boxShadow = 'none';
    button.style.padding = '0';
    button.style.width = '36px';
    button.style.height = '36px';
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.cursor = 'pointer';
    button.style.margin = '0';
    button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease';
    
    // Create the copy icon (using SVG for consistency)
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('width', '18');
    iconSvg.setAttribute('height', '18');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.style.stroke = 'currentColor';
    iconSvg.style.strokeWidth = '2';
    iconSvg.style.strokeLinecap = 'round';
    iconSvg.style.strokeLinejoin = 'round';
    
    // Path 1 for the document
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V4Z');
    
    // Path 2 for the second document (behind)
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8');
    
    iconSvg.appendChild(path1);
    iconSvg.appendChild(path2);
    button.appendChild(iconSvg);
    
    // Add hover effect
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    });
    
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = 'transparent';
    });
    
    // Add active/click effect for bottom right position
    button.addEventListener('mousedown', function() {
        button.style.transform = 'scale(0.9)'; // Scale down when pressed
        button.style.opacity = '0.7';
    });
    
    button.addEventListener('mouseup', function() {
        button.style.transform = 'scale(1)';
        button.style.opacity = '1';
    });
    
    // Add click event to open share modal
    button.addEventListener('click', function() {
        openShareModal(containerId, getContentCallback);
    });
    
    // Append button to container, and container to body
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
    
    // Add media query for mobile devices
    const mobileQuery = window.matchMedia("(max-width: 480px)");
    const adjustForMobile = (query) => {
        if (query.matches) { // If media query matches (mobile)
            button.style.width = '28px'; // Match mobile tab width
            button.style.height = '28px'; // Match mobile tab height
            iconSvg.setAttribute('width', '14');
            iconSvg.setAttribute('height', '14');
            // Keep button snug in the corner even on mobile
            buttonContainer.style.bottom = '0';
            buttonContainer.style.right = '0';
        } else {
            button.style.width = '36px'; // Desktop size
            button.style.height = '36px'; // Desktop size
            iconSvg.setAttribute('width', '18');
            iconSvg.setAttribute('height', '18');
            // Keep button snug in the corner
            buttonContainer.style.bottom = '0';
            buttonContainer.style.right = '0';
        }
    };
    
    // Initial check
    adjustForMobile(mobileQuery);
    
    // Listen for changes (like rotation)
    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', adjustForMobile);
    } else {
        mobileQuery.addListener(adjustForMobile); // Fallback for older browsers
    }
    
    return buttonContainer;
}

/**
 * Open the share modal with multiple options
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function openShareModal(containerId, getContentCallback) {
    // Create modal backdrop
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'share-modal-backdrop';
    modalBackdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20000;
        font-family: "Inter", sans-serif;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'share-modal-content';
    modalContent.style.cssText = `
        background-color: #f2f9f3;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #4a7c59;
        box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
        max-width: 300px;
        width: 90%;
        text-align: center;
        font-family: "Inter", sans-serif;
    `;

    // Ensure Font Awesome is loaded before creating modal content
    window.enhancedUI.ensureFontAwesome(() => {
        modalContent.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <!--
                <button class="share-action-btn" data-action="share" style="
                    padding: 14px 20px;
                    background-color: #f2f9f3;
                    color: #2d5a3d;
                    border: 1px solid #4a7c59;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Geist', sans-serif;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
                ">
                    <i class="fas fa-share-alt" style="margin-right: 8px; font-size: 14px;"></i>Share as PDF
                </button>
                -->
                <button class="share-action-btn" data-action="print" style="
                    padding: 14px 20px;
                    background-color: #f2f9f3;
                    color: #2d5a3d;
                    border: 1px solid #4a7c59;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Geist', sans-serif;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
                ">
                    <i class="fas fa-print" style="margin-right: 8px; font-size: 14px;"></i>Print
                </button>
                <button class="share-action-btn" data-action="pdf" style="
                    padding: 14px 20px;
                    background-color: #f2f9f3;
                    color: #2d5a3d;
                    border: 1px solid #4a7c59;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    font-family: 'Geist', sans-serif;
                    font-weight: bold;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(74, 124, 89, 0.2);
                ">
                    <i class="fas fa-download" style="margin-right: 8px; font-size: 14px;"></i>Save as PDF
                </button>
            </div>
        `;
        
        // Add hover effects after content is created
        addButtonHoverEffects();
        
        // Add click handlers after content is created
        addButtonClickHandlers();
    });

    modalBackdrop.appendChild(modalContent);
    document.body.appendChild(modalBackdrop);

    // Helper function to add hover effects
    function addButtonHoverEffects() {
        modalContent.querySelectorAll('.share-action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#eef7f0';
                this.style.transform = 'translateY(-1px)';
                this.style.boxShadow = '0 3px 8px rgba(74, 124, 89, 0.3)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#f2f9f3';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 4px rgba(74, 124, 89, 0.2)';
            });
            
            btn.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 1px 2px rgba(74, 124, 89, 0.3)';
            });
            
            btn.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-1px)';
                this.style.boxShadow = '0 3px 8px rgba(74, 124, 89, 0.3)';
            });
        });
    }

    // Helper function to add click handlers
    function addButtonClickHandlers() {
        modalContent.addEventListener('click', function(event) {
            const action = event.target.closest('.share-action-btn')?.dataset.action;
            
            if (action) {
                handleShareAction(action, containerId, getContentCallback);
                closeShareModal(modalBackdrop);
            }
        });
    }

    // Close on backdrop click
    modalBackdrop.addEventListener('click', function(event) {
        if (event.target === modalBackdrop) {
            closeShareModal(modalBackdrop);
        }
    });

    // Close on Escape key
    const escapeHandler = function(event) {
        if (event.key === 'Escape') {
            closeShareModal(modalBackdrop);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Close the share modal
 * @param {HTMLElement} modalBackdrop - The modal backdrop element to remove
 */
function closeShareModal(modalBackdrop) {
    if (modalBackdrop && modalBackdrop.parentNode) {
        modalBackdrop.parentNode.removeChild(modalBackdrop);
    }
}

/**
 * Handle different share actions
 * @param {string} action - The action to perform (share, print, pdf, copy)
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function handleShareAction(action, containerId, getContentCallback) {
    switch (action) {
        case 'share':
            shareContent(containerId, getContentCallback);
            break;
        case 'print':
            printContent();
            break;
        case 'pdf':
            downloadAsPDF(containerId, getContentCallback);
            break;
    }
}

/**
 * Share content by generating a PDF file for attachment
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function shareContent(containerId, getContentCallback) {
    const containerEl = document.getElementById(containerId);
    if (!containerEl) {
        console.error(`Element with ID '${containerId}' not found`);
        window.enhancedUI.showToast('Cannot find content to share. Please ensure the page has fully loaded.', 'error');
        return;
    }

    // Show loading toast
    const loadingToast = window.enhancedUI.showToast('Preparing content for sharing...', 'info', 10000);
    
    // Load jsPDF library if not already loaded
    if (typeof jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            window.enhancedUI.closeToast(loadingToast);
            generateShareablePDF(containerId, getContentCallback);
        };
        script.onerror = () => {
            window.enhancedUI.closeToast(loadingToast);
            window.enhancedUI.showToast('Failed to load PDF library. Please check your internet connection.', 'error');
        };
        document.head.appendChild(script);
    } else {
        window.enhancedUI.closeToast(loadingToast);
        generateShareablePDF(containerId, getContentCallback);
    }
}

/**
 * Generate a PDF for sharing
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function generateShareablePDF(containerId, getContentCallback) {
    const progressToast = window.enhancedUI.showToast('Creating shareable PDF...', 'info', 15000);
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Validate element exists and has content
        const containerEl = document.getElementById(containerId);
        if (!containerEl) {
            throw new Error(`Cannot generate PDF: Element with ID '${containerId}' not found.`);
        }

        const hasLoadingContent = containerEl.querySelector('.loading, .loading-text, .loading-spinner');
        const textContent = containerEl.textContent || containerEl.innerText || '';
        const hasActualContent = textContent.trim().length > 0;
        
        if (hasLoadingContent && !hasActualContent) {
            throw new Error('Content is still loading. Please wait for the analysis to fully load.');
        }

        if (!hasActualContent) {
            throw new Error('No content available to share.');
        }

        let content = '';
        if (typeof getContentCallback === 'function') {
            content = getContentCallback(containerEl);
        } else {
            content = extractVisibleContent(containerEl);
        }

        // Generate PDF with same styling as downloadAsPDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;
        const lineHeight = 6;
        const marginLeft = 20;
        const marginRight = 20;
        const maxWidth = pageWidth - marginLeft - marginRight;
        
        // Header
        doc.setFillColor(110, 142, 251);
        doc.rect(0, 0, pageWidth, 15, 'F');
        
        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(document.title || 'Content Export', marginLeft, 10);
        
        // Reset colors for body
        doc.setTextColor(0, 0, 0);
        yPosition = 25;
        
        // Date and source
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, marginLeft, yPosition);
        yPosition += 6;
        doc.text('Powered by INEXASLI', marginLeft, yPosition);
        yPosition += 15;
        
        // Function to add text with word wrapping
        function addWrappedText(text, fontSize = 10, isBold = false) {
            doc.setFontSize(fontSize);
            doc.setFont(undefined, isBold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(text, maxWidth);
            
            lines.forEach(line => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, marginLeft, yPosition);
                yPosition += lineHeight;
            });
            yPosition += 2;
        }
        
        // Add content
        addWrappedText(content, 10, false);
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount} | INEXASLI Content Export`, 
                marginLeft, pageHeight - 10);
        }
        
        window.enhancedUI.closeToast(progressToast);
        
        // Create a blob from the PDF
        const pdfBlob = doc.output('blob');
        const { analysisType, title } = getAnalysisTypeFromPage();
        const filename = `${analysisType}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Try to use Web Share API with the PDF file
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename, { type: 'application/pdf' })] })) {
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });
            navigator.share({
                title: document.title || 'INEXASLI Content',
                text: 'Sharing content from INEXASLI',
                files: [file]
            }).then(() => {
                window.enhancedUI.showToast('PDF shared successfully!', 'success');
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    console.log('Web Share API failed, falling back to download:', error);
                    fallbackPDFShare(pdfBlob, filename);
                }
            });
        } else {
            // Fallback: Download the PDF for manual sharing
            fallbackPDFShare(pdfBlob, filename);
        }
        
    } catch (error) {
        console.error('PDF generation error:', error);
        window.enhancedUI.closeToast(progressToast);
        
        if (error.message.includes('not found')) {
            window.enhancedUI.showToast('Cannot find content to share. Please ensure the page has fully loaded.', 'error', 5000);
        } else if (error.message.includes('still loading')) {
            window.enhancedUI.showToast('Content is still loading. Please wait a moment and try again.', 'warning', 5000);
        } else if (error.message.includes('No content available')) {
            window.enhancedUI.showToast('No content available to share. Please ensure content has loaded.', 'error', 5000);
        } else {
            window.enhancedUI.showToast('Error creating shareable PDF. Please try again.', 'error');
        }
    }
}

/**
 * Fallback method when Web Share API is not available or fails
 * @param {Blob} pdfBlob - The PDF blob to download
 * @param {string} filename - The filename for the PDF
 */
function fallbackPDFShare(pdfBlob, filename) {
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    window.enhancedUI.showToast(`PDF "${filename}" downloaded! You can now attach it to emails, messages, or share it however you like.`, 'success', 6000);
}

/**
 * Print the current page
 */
function printContent() {
    window.enhancedUI.showToast('Preparing content for printing...', 'info', 2000);
    setTimeout(() => {
        window.print();
        setTimeout(() => {
            window.enhancedUI.showToast('Print dialog opened. You can also save as PDF from the print options.', 'info');
        }, 1000);
    }, 500);
}

/**
 * Download content as PDF
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function downloadAsPDF(containerId, getContentCallback) {
    const loadingToast = window.enhancedUI.showToast('Preparing PDF download...', 'info', 10000);
    
    // Load jsPDF library if not already loaded
    if (typeof jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            window.enhancedUI.closeToast(loadingToast);
            generatePDF(containerId, getContentCallback);
        };
        script.onerror = () => {
            window.enhancedUI.closeToast(loadingToast);
            window.enhancedUI.showToast('Failed to load PDF library. Please check your internet connection.', 'error');
        };
        document.head.appendChild(script);
    } else {
        window.enhancedUI.closeToast(loadingToast);
        generatePDF(containerId, getContentCallback);
    }
}

/**
 * Extract visible content from container, excluding scripts and hidden elements
 * @param {HTMLElement} container - The container element
 * @returns {string} - Clean text content for PDF generation
 */
function extractVisibleContent(container) {
    // Try to get clean text content using multiple methods
    let content = '';
    
    // Method 1: Check if this is enneagram content with card structure
    const cards = container.querySelectorAll('.enneagram-card:not(.loading)');
    if (cards.length > 0) {
        cards.forEach(card => {
            // Extract card title
            const title = card.querySelector('.card-title');
            if (title) {
                content += title.textContent.trim() + '\n';
            }
            
            // Extract card subtitle
            const subtitle = card.querySelector('.card-subtitle');
            if (subtitle) {
                content += subtitle.textContent.trim() + '\n';
            }
            
            // Extract card body content
            const body = card.querySelector('.card-body');
            if (body) {
                // Get text from paragraphs and sections
                const textElements = body.querySelectorAll('p, .section-content, li, h3');
                textElements.forEach(el => {
                    const text = el.textContent.trim();
                    if (text && !text.includes('fas fa-') && !text.includes('margin-right')) {
                        content += text + '\n';
                    }
                });
            }
            
            content += '\n'; // Space between cards
        });
    } else {
        // Method 2: General content extraction for other types of content
        const clone = container.cloneNode(true);
        
        // Remove unwanted elements
        const unwantedSelectors = [
            'script', 'style', 'noscript',
            '.loading', '.loading-text', '.loading-spinner',
            '[style*="display: none"]', '[style*="display:none"]',
            '[style*="visibility: hidden"]', '[style*="visibility:hidden"]',
            '.hidden', '[hidden]'
        ];
        
        unwantedSelectors.forEach(selector => {
            try {
                const elements = clone.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        // Extract text content
        content = clone.textContent || clone.innerText || '';
    }
    
    // Clean up the content
    content = content
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s+/g, '\n') // Remove spaces after newlines
        .replace(/\s+\n/g, '\n') // Remove spaces before newlines
        .replace(/\n+/g, '\n\n') // Replace multiple newlines with double newlines
        .trim();
    
    return content;
}

/**
 * Generate PDF from content - Simple and reliable visual capture
 * @param {string} containerId - ID of the container element
 * @param {Function} getContentCallback - Optional callback to get specific formatted content
 */
function generatePDF(containerId, getContentCallback) {
    console.log('🎯 Starting PDF generation - checking for output content');
    const progressToast = window.enhancedUI.showToast('📄 Generating PDF...', 'info', 15000);
    
    // Target the main output container with device-container class
    const outputContainer = document.querySelector('#main-content.device-container');
    if (!outputContainer) {
        window.enhancedUI.closeToast(progressToast);
        window.enhancedUI.showToast('⚠️ No analysis results to save. Please complete the form and generate your analysis first.', 'warning', 6000);
        return;
    }
    
    // Check if output container has actual content
    const outputContent = outputContainer.textContent || outputContainer.innerText || '';
    const hasValidContent = outputContent.trim().length > 50 && 
                           !outputContent.includes('No content loaded yet') &&
                           outputContainer.querySelector('h3, p, .content-section, .analysis-result');
    
    if (!hasValidContent) {
        window.enhancedUI.closeToast(progressToast);
        window.enhancedUI.showToast('⚠️ No analysis results found. Please generate your analysis first.', 'warning', 6000);
        return;
    }
    
    console.log('📱 Found output content, generating PDF...');
    
    // Load required libraries
    Promise.all([
        loadLibrary('html2canvas', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
        loadLibrary('jsPDF', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
    ]).then(() => {
        console.log('✅ Libraries loaded, capturing output content');
        captureOutputContainer(outputContainer, progressToast);
    }).catch(error => {
        console.error('❌ Failed to load libraries:', error);
        window.enhancedUI.closeToast(progressToast);
        window.enhancedUI.showToast('❌ Failed to load PDF libraries. Check your internet connection.', 'error');
    });
}

/**
 * Load a library if not already present
 * @param {string} globalName - Global variable name to check
 * @param {string} scriptUrl - URL to load the script from
 * @returns {Promise} - Promise that resolves when library is loaded
 */
function loadLibrary(globalName, scriptUrl) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (globalName === 'jsPDF' && window.jspdf && window.jspdf.jsPDF) {
            console.log(`✅ ${globalName} already loaded`);
            resolve();
            return;
        }
        if (globalName === 'html2canvas' && window.html2canvas) {
            console.log(`✅ ${globalName} already loaded`);
            resolve();
            return;
        }
        
        console.log(`📥 Loading ${globalName} from ${scriptUrl}`);
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = () => {
            console.log(`✅ ${globalName} loaded successfully`);
            resolve();
        };
        script.onerror = () => {
            console.error(`❌ Failed to load ${globalName}`);
            reject(new Error(`Failed to load ${globalName}`));
        };
        document.head.appendChild(script);
    });
}

/**
 * Capture output container and create PDF - Simple and reliable
 * @param {HTMLElement} outputContainer - The output container element
 * @param {string} progressToast - Progress toast ID
 */
function captureOutputContainer(outputContainer, progressToast) {
    console.log('📸 Starting output container capture');
    
    // Update progress
    window.enhancedUI.closeToast(progressToast);
    const captureToast = window.enhancedUI.showToast('📸 Capturing analysis results...', 'info', 10000);
    
    // Prepare the output container for capture
    prepareOutputContainerForCapture(outputContainer);
    
    // Wait a moment for any transitions to complete
    setTimeout(() => {
        console.log('🎯 Executing html2canvas on output container');
        
        html2canvas(outputContainer, {
            scale: 2, // Good quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 15000,
            onclone: function(clonedDoc) {
                // Clean up the cloned document
                const clonedContainer = clonedDoc.querySelector('#main-content.device-container');
                if (clonedContainer) {
                    // Remove any unwanted elements
                    const elementsToRemove = clonedContainer.querySelectorAll(
                        '#copyButtonContainer, #copyButton, .loading, .loading-spinner, script, .share-modal-backdrop'
                    );
                    elementsToRemove.forEach(el => el.remove());
                }
            }
        }).then(canvas => {
            console.log('✅ Output container captured successfully');
            window.enhancedUI.closeToast(captureToast);
            
            // Validate canvas has content
            if (canvas.width === 0 || canvas.height === 0) {
                console.error('❌ Canvas is empty');
                window.enhancedUI.showToast('❌ Failed to capture analysis results. Using text fallback...', 'warning');
                generateSimpleTextPDF();
                return;
            }
            
            // Create PDF with captured image
            createPDFFromCanvas(canvas);
            
        }).catch(error => {
            console.error('❌ html2canvas failed:', error);
            window.enhancedUI.closeToast(captureToast);
            window.enhancedUI.showToast('❌ Visual capture failed. Using text fallback...', 'warning');
            generateSimpleTextPDF();
        });
    }, 1000);
}

/**
 * Prepare output container for optimal visual capture
 * @param {HTMLElement} outputContainer - Output container element
 */
function prepareOutputContainerForCapture(outputContainer) {
    console.log('🎯 Preparing output container for capture');
    
    // Force all content to be visible and remove animations
    const allElements = outputContainer.querySelectorAll('*');
    allElements.forEach(el => {
        // Only modify elements that aren't intentionally hidden
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.display !== 'none' && !el.hasAttribute('hidden')) {
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('animation', 'none', 'important');
            el.style.setProperty('transition', 'none', 'important');
        }
    });
    
    // Remove any loading indicators
    const loadingElements = outputContainer.querySelectorAll('.loading, .loading-spinner, .loading-text');
    loadingElements.forEach(el => {
        el.style.display = 'none';
    });
    
    console.log('✅ Output container prepared for capture');
}

/**
 * Determine the analysis type and filename prefix based on current page
 * @returns {Object} - Object with analysisType and title
 */
function getAnalysisTypeFromPage() {
    console.log('[PDF] Starting analysis type detection...');
    
    // Enhanced debugging - log all relevant information
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    const lastGridItemUrl = localStorage.getItem('lastGridItemUrl');
    
    console.log('[PDF] Current path:', currentPath);
    console.log('[PDF] Current href:', currentHref);
    console.log('[PDF] lastGridItemUrl:', lastGridItemUrl);
    
    // Also check all localStorage keys for debugging
    console.log('[PDF] All localStorage keys:', Object.keys(localStorage));
    
    // Function to extract analysis type from URL
    function extractAnalysisType(url) {
        if (!url) return null;
        
        console.log('[PDF] Checking URL patterns for:', url);
        
        // Check for patterns in the URL
        if (url.includes('/calorie/') || url.includes('calorie')) {
            console.log('[PDF] Matched calorie pattern');
            return { analysisType: 'calorie-analysis', title: 'Calorie Analysis' };
        }
        if (url.includes('/enneagram/') || url.includes('enneagram')) {
            console.log('[PDF] Matched enneagram pattern');
            return { analysisType: 'enneagram-analysis', title: 'Enneagram Analysis' };
        }
        if (url.includes('/fitness/') || url.includes('fitness')) {
            console.log('[PDF] Matched fitness pattern');
            return { analysisType: 'fitness-analysis', title: 'Fitness Analysis' };
        }
        if (url.includes('/decision/') || url.includes('decision')) {
            console.log('[PDF] Matched decision pattern');
            return { analysisType: 'decision-analysis', title: 'Decision Analysis' };
        }
        if (url.includes('/philosophy/') || url.includes('philosophy')) {
            console.log('[PDF] Matched philosophy pattern');
            return { analysisType: 'philosophy-analysis', title: 'Philosophy Analysis' };
        }
        if (url.includes('/quiz/') || url.includes('quiz')) {
            console.log('[PDF] Matched quiz pattern');
            return { analysisType: 'quiz-results', title: 'Quiz Results' };
        }
        if (url.includes('/event/') || url.includes('event')) {
            console.log('[PDF] Matched event pattern');
            return { analysisType: 'event-analysis', title: 'Event Analysis' };
        }
        if (url.includes('/adventure/') || url.includes('adventure')) {
            console.log('[PDF] Matched adventure pattern');
            return { analysisType: 'adventure-analysis', title: 'Adventure Analysis' };
        }
        if (url.includes('/social/') || url.includes('social')) {
            console.log('[PDF] Matched social pattern');
            return { analysisType: 'social-analysis', title: 'Social Analysis' };
        }
        if (url.includes('/research/') || url.includes('research')) {
            console.log('[PDF] Matched research pattern');
            return { analysisType: 'research-analysis', title: 'Research Analysis' };
        }
        if (url.includes('/newbiz/') || url.includes('newbiz') || url.includes('business')) {
            console.log('[PDF] Matched business pattern');
            return { analysisType: 'business-analysis', title: 'Business Analysis' };
        }
        if (url.includes('/symptom/') || url.includes('symptom')) {
            console.log('[PDF] Matched symptom pattern');
            return { analysisType: 'symptom-analysis', title: 'Symptom Analysis' };
        }
        if (url.includes('/book/') || url.includes('book')) {
            console.log('[PDF] Matched book pattern');
            return { analysisType: 'book-analysis', title: 'Book Analysis' };
        }
        if (url.includes('/speculation/') || url.includes('speculation')) {
            console.log('[PDF] Matched speculation pattern');
            return { analysisType: 'speculation-analysis', title: 'Speculation Analysis' };
        }
        
        console.log('[PDF] No pattern matched for URL:', url);
        return null;
    }
    
    // Try lastGridItemUrl first
    if (lastGridItemUrl) {
        console.log('[PDF] Checking lastGridItemUrl...');
        const result = extractAnalysisType(lastGridItemUrl);
        if (result) {
            console.log('[PDF] Found analysis type from lastGridItemUrl:', result);
            return result;
        }
    }
    
    // Fallback to current URL
    console.log('[PDF] Checking current URL path...');
    const pathResult = extractAnalysisType(currentPath);
    if (pathResult) {
        console.log('[PDF] Found analysis type from current path:', pathResult);
        return pathResult;
    }
    
    // Fallback to current href
    console.log('[PDF] Checking current href...');
    const hrefResult = extractAnalysisType(currentHref);
    if (hrefResult) {
        console.log('[PDF] Found analysis type from current href:', hrefResult);
        return hrefResult;
    }
    
    // Check if we're on an output page and try to extract from page content
    if (currentPath.includes('output') || currentHref.includes('output')) {
        console.log('[PDF] On output page, checking page title...');
        const pageTitle = document.title.toLowerCase();
        console.log('[PDF] Page title:', pageTitle);
        
        const titleResult = extractAnalysisType(pageTitle);
        if (titleResult) {
            console.log('[PDF] Found analysis type from page title:', titleResult);
            return titleResult;
        }
    }
    
    console.log('[PDF] Could not determine analysis type, using default');
    return { analysisType: 'inexasli-analysis', title: 'INEXASLI Analysis' };
}

/**
 * Create PDF from captured canvas
 * @param {HTMLCanvasElement} canvas - Captured canvas
 */
function createPDFFromCanvas(canvas) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    
    // Calculate image dimensions to fit page
    const availableWidth = pdfWidth - (2 * margin);
    const availableHeight = pdfHeight - (2 * margin);
    const aspectRatio = canvas.width / canvas.height;
    
    let imgWidth, imgHeight;
    if (aspectRatio > availableWidth / availableHeight) {
        imgWidth = availableWidth;
        imgHeight = imgWidth / aspectRatio;
    } else {
        imgHeight = availableHeight;
        imgWidth = imgHeight * aspectRatio;
    }
    
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    
    // Convert canvas to image and add to PDF (using PNG for crisp quality)
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated by INEXASLI | ${new Date().toLocaleDateString()}`, margin, pdfHeight - 5);
    
    // Save PDF with dynamic filename
    const timestamp = new Date().toISOString().split('T')[0];
    const { analysisType, title } = getAnalysisTypeFromPage();
    const filename = `${analysisType}-${timestamp}.pdf`;
    pdf.save(filename);
    
    console.log('🎉 Visual PDF generated successfully!');
    window.enhancedUI.showToast(`🎉 Visual PDF "${filename}" downloaded successfully!`, 'success', 5000);
}

/**
 * Generate simple text-based PDF as fallback
 */
function generateSimpleTextPDF() {
    console.log('📝 Generating simple text-based fallback PDF');
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Find output container content
        const outputContainer = document.querySelector('#main-content.device-container');
        if (!outputContainer) {
            throw new Error('Output container not found');
        }
        
        let yPosition = 20;
        const pageHeight = doc.internal.pageSize.height;
        const lineHeight = 6;
        const margin = 20;
        const maxWidth = doc.internal.pageSize.width - (2 * margin);
        
        // Add title
        doc.setFontSize(16);
        doc.text('Analysis Results', margin, yPosition);
        yPosition += 15;
        
        // Extract and add text content
        const textContent = outputContainer.textContent || outputContainer.innerText || '';
        const cleanText = textContent
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .trim();
        
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(cleanText, maxWidth);
        
        lines.forEach(line => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
        });
        
        // Add footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated by INEXASLI | ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
        
        // Save PDF
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `analysis-results-${timestamp}.pdf`;
        doc.save(filename);
        
        console.log('📄 Simple text PDF generated successfully');
        window.enhancedUI.showToast(`📄 Text-based PDF "${filename}" downloaded`, 'success', 5000);
        
    } catch (error) {
        console.error('❌ Failed to generate simple text PDF:', error);
        window.enhancedUI.showToast('❌ Failed to generate PDF. Please try again.', 'error');
    }
}

/**
 * Initialize the copy button functionality
 * @param {Object} options - Configuration options
 * @param {string} options.containerId - ID of the container with content to copy
 * @returns {HTMLElement} - The button container element
 */
function initCopyButton(options = {}) {
    const { containerId = 'output-span' } = options;
    return createCopyButton(containerId);
}

// Export functions for use in other files
// Global utility object for external access
window.copyUtil = {
    init: initCopyButton,
    openShareModal: openShareModal
};

// Make print function globally accessible
window.printContent = printContent;