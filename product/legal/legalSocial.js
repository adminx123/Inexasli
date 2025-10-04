/**
 * Legal Modal System - Social Media Automation Business Terms
 * Displays comprehensive legal content for INEXASLI social media automation services
 */

console.log('[LegalSocial] Script loading...');

// Terms of Service content for Social Media Automation Business
const TERMS_OF_SERVICE = {
    title: "Terms of Service for INEXASLI Social Media Automation Services",
    
    // Main disclaimer at the top
    disclaimer: `INEXASLI provides managed social media automation services for businesses using proprietary AI technology. These services include automated content creation, posting, and social media management across multiple platforms. By purchasing our automation services, businesses acknowledge that all content is AI-generated and should be reviewed before posting. INEXASLI is not responsible for third-party platform restrictions, account actions, or the accuracy of AI-generated content.

*Disclaimer: INEXASLI social media automation services are designed for business marketing and engagement purposes. All content is generated using artificial intelligence systems and should be reviewed by businesses before posting. While our technology aims to create engaging, brand-appropriate content, businesses are responsible for ensuring all posts comply with platform guidelines and accurately represent their brand. AI can make mistakes or produce content that may not align with your brand voice. For best results, businesses should monitor automated posts and provide feedback for continuous improvement. Any use of our automation services is at the business's own risk.*`,

    sections: [
        {
            title: "Introduction",
            content: `This document outlines the terms of service for INEXASLI's managed social media automation services (the "Services") provided by INEXASLI, a technology company specializing in AI-powered business automation (hereinafter referred to as the "Company"). By purchasing our automation services, you (the "Client" or "Business") agree to be bound by these terms of service. If you do not agree with these terms, you must not use the Services.

Company Definition: INEXASLI is a technology company that provides managed social media automation services for businesses. We specialize in AI-powered content creation, automated posting, and social media management across multiple platforms including Instagram, Facebook, LinkedIn, and X (formerly Twitter). Our core business is developing and operating automation technology that creates and publishes social media content on behalf of our business clients.

Service Description: Our Services include automated social media content creation, scheduled posting, hashtag optimization, and basic engagement monitoring. Businesses purchase managed automation services where INEXASLI operates the technology on their behalf. Clients do not receive ownership of the underlying technology, software, or code - they purchase access to our managed automation service.`
        },
        {
            title: "Social Media Automation Services",
            content: `**Managed Automation for Businesses**
- INEXASLI provides comprehensive social media automation including content creation, posting schedules, and basic engagement monitoring.
- Services include automated posting to Instagram, Facebook, LinkedIn, and X (formerly Twitter) based on client's selected package.
- All content is generated using proprietary AI technology and should be considered AI-generated material.
- Businesses purchase access to managed services, not ownership of the underlying technology, software, or code.

**Platform Compliance and Responsibilities**
- Businesses must comply with all applicable social media platform terms of service and community guidelines.
- Clients must provide accurate business information, branding guidelines, and content preferences.
- INEXASLI is not responsible for third-party platform restrictions, outages, algorithm changes, or account actions.
- Businesses are responsible for maintaining their social media accounts in good standing.

**Content Review and Approval**
- All AI-generated content should be considered draft material requiring business review.
- Businesses are responsible for monitoring automated posts and reporting any inappropriate content immediately.
- INEXASLI provides content creation and posting automation but does not guarantee content accuracy, appropriateness, or platform compliance.
- Clients should establish internal review processes for AI-generated content to ensure brand alignment.

**Account Access and Setup**
- Businesses must provide necessary account access and authentication for social media platforms.
- INEXASLI requires appropriate permissions to post content on behalf of the business.
- Businesses retain ownership of their social media accounts and can revoke access at any time.
- INEXASLI will not access or modify account settings beyond those necessary for content posting.`
        },
        {
            title: "Intellectual Property",
            content: `**Service Technology Ownership**
- All rights, title, and interest in INEXASLI's automation technology, software, algorithms, and systems remain the exclusive property of INEXASLI.
- Businesses are granted a limited, non-exclusive, non-transferable license to use our managed automation services during the service period.
- No source code, algorithms, or proprietary technology is transferred to clients.

**Client Content and Brand Materials**
- Businesses retain ownership of their brand materials, logos, and provided content.
- By engaging our services, businesses grant INEXASLI permission to use their brand materials solely for the purpose of creating and posting social media content.
- AI-generated content created for clients becomes the property of the client upon posting.

**Generated Content Ownership**
- Social media content generated by our AI systems becomes the property of the client business.
- INEXASLI retains the right to use aggregated, anonymized data for service improvement.
- Clients may use AI-generated content across their marketing channels beyond social media.`
        },
        {
            title: "Service Packages and Billing",
            content: `**Package Structure**
- Services are offered in tiered packages: Starter ($397), Professional ($697), and Enterprise ($997).
- Each package includes specific numbers of platforms, posts, and additional features.
- Add-on services available for additional photos, videos, and extra platforms.

**Billing and Payment Terms**
- All packages require upfront payment for setup and first month of service.
- Monthly billing begins after initial setup completion (typically 2-3 business days).
- Payments processed securely through Stripe payment processing.
- All sales are final - no refunds after service setup begins.

**Service Modifications**
- Package upgrades available at any time with prorated pricing.
- Service cancellation requires 30-day notice to avoid next month's billing.
- Downgrades take effect at the next billing cycle.`
        },
        {
            title: "Platform-Specific Terms",
            content: `**Instagram Automation**
- Requires Instagram Business account for API access.
- Subject to Instagram's terms of service and API limitations.
- INEXASLI not responsible for Instagram policy changes affecting automation.

**Facebook/Meta Platform Integration**
- Utilizes Facebook Business Manager and Meta Business API.
- Subject to Meta's terms of service and platform policies.
- Changes to Meta's API may affect service functionality.

**LinkedIn Business Posting**
- Requires LinkedIn Business account with appropriate permissions.
- Subject to LinkedIn's professional platform guidelines.
- Content must maintain professional standards appropriate for LinkedIn.

**X (Twitter) Integration**
- Subject to X's terms of service and API access policies.
- INEXASLI not responsible for X platform changes or policy updates.
- Content must comply with X's community guidelines.`
        },
        {
            title: "Limitation of Liability",
            content: `**Service Limitations**
- INEXASLI provides automation technology "as is" without warranties of any kind.
- We do not guarantee specific engagement rates, follower growth, or business outcomes.
- Social media platform algorithm changes may affect content performance.

**Business Automation Liability**
- INEXASLI is not liable for business losses, missed posts, reputational harm, or third-party platform actions.
- Not responsible for account suspension, removal, or platform policy violations.
- Maximum liability limited to the amount paid for services in the preceding month.

**Content Disclaimer**
- AI-generated content may occasionally be inaccurate, inappropriate, or off-brand.
- Businesses are responsible for monitoring and approving all automated content.
- INEXASLI not liable for reputational damage from AI-generated content.

**Third-Party Platform Risks**
- Social media platforms may change policies, APIs, or terms of service without notice.
- Platform outages or technical issues may temporarily interrupt service.
- INEXASLI will work to resolve platform-related issues but cannot guarantee continuous service.`
        },
        {
            title: "Privacy and Data Handling",
            content: `**Business Data Collection**
- We collect business information necessary to provide automation services.
- Information includes business name, industry, brand guidelines, and content preferences.
- Social media account access tokens stored securely for posting purposes.

**Content Data Usage**
- Posted content data used for service improvement and analytics.
- Aggregated, anonymized data may be used for platform optimization.
- Individual business content remains confidential and is not shared with third parties.

**Platform Integration Data**
- Social media platform APIs may collect additional data per their privacy policies.
- Businesses should review privacy policies of all connected social media platforms.
- INEXASLI acts as a data processor for social media posting purposes only.

**Data Security**
- All business data encrypted in transit and at rest.
- Social media access tokens stored using industry-standard security practices.
- Regular security audits and updates to protect client information.`
        },
        {
            title: "Service Level Agreement",
            content: `**Setup Timeline**
- Initial service setup completed within 2-3 business days of payment.
- Instagram OAuth connection required before content posting begins.
- Businesses notified via email when setup is complete.

**Posting Schedule**
- Content posted according to package specifications and optimal timing.
- Posting schedules optimized for audience engagement based on platform best practices.
- Emergency stop available if businesses need to halt posting immediately.

**Support and Communication**
- Email support provided for service questions and issues.
- Response time goal of 24 hours for non-emergency inquiries.
- Emergency contact available for urgent posting issues.

**Service Monitoring**
- Automated monitoring of posting success and platform connectivity.
- Proactive notification of any service interruptions or issues.
- Regular service health checks and optimization updates.`
        },
        {
            title: "Termination",
            content: `**Client Termination Rights**
- Services may be cancelled with 30-day written notice.
- Final month billed if cancellation notice provided after billing date.
- No refunds for partial months of service.

**INEXASLI Termination Rights**
- Services may be terminated for violation of terms of service.
- Termination for non-payment after 7-day grace period.
- Immediate termination for illegal use or platform policy violations.

**Data Retention After Termination**
- Posted content remains on social media platforms (client property).
- INEXASLI account access removed within 24 hours of termination.
- Business data deleted from INEXASLI systems within 30 days.

**Transition Assistance**
- Content posting schedules provided upon request for service transition.
- Basic guidance available for maintaining social media presence independently.
- No obligation to provide proprietary technology or algorithms.`
        },
        {
            title: "Refund Policy",
            content: `**Refund Window**
- Refunds available within 30 days from the start of automation service.
- Requests must be submitted in writing to support@inexasli.com.

**Eligibility for Refunds**
- Refunds granted if service fails to deliver promised automation features.
- Refunds for major technical issues preventing content posting.
- Refunds if service is canceled before any posts are made.
- No refunds for completed posts, client-requested content changes, or dissatisfaction with AI-generated content.

**Partial Refunds**
- No partial refunds for mid-cycle cancellations; service continues until end of current billing month.
- Setup fees are non-refundable once service setup begins.

**Non-Refundable Items**
- Completed content posting and associated costs.
- Third-party platform fees or API costs incurred.
- Service fees for months where content was successfully posted.

**Refund Process**
- Submit refund request via email to support@inexasli.com with reason and account details.
- Refunds processed within 7-10 business days of approval.
- Refunds issued to original payment method.

**Conditions**
- Clients must provide necessary account access and comply with terms.
- Refunds exclude any costs from client violations of platform policies or terms.
- AI-generated content is reviewed by clients; refunds not available for content-related dissatisfaction.`
        }
    ]
};

// Privacy Policy content for Social Media Automation Business
const PRIVACY_POLICY = {
    title: "Privacy Policy for INEXASLI Social Media Automation Services",
    
    sections: [
        {
            title: "Information We Collect",
            content: `**Business Information**
- Company name, industry, and business description
- Contact information including email, phone, and business address
- Brand guidelines, logos, and marketing materials
- Social media account information and access credentials

**Service Usage Data**
- Content posting history and engagement metrics
- Platform connection status and posting success rates
- Service configuration and preference settings
- Support interactions and feedback

**Automatically Collected Data**
- Website usage analytics and interaction patterns
- IP addresses and browser information for security purposes
- Payment processing information (processed by Stripe)
- Error logs and technical performance data`
        },
        {
            title: "How We Use Information",
            content: `**Service Delivery**
- To create and post social media content on behalf of businesses
- To manage posting schedules and optimize content timing
- To monitor service performance and resolve technical issues
- To provide customer support and service updates

**Service Improvement**
- To enhance AI content generation algorithms
- To optimize posting schedules and engagement strategies
- To develop new features and service offerings
- To analyze service performance and user satisfaction

**Business Operations**
- To process payments and manage billing
- To communicate service updates and important notices
- To comply with legal obligations and platform requirements
- To protect against fraud and unauthorized access`
        },
        {
            title: "Information Sharing",
            content: `**Third-Party Platforms**
- Social media content shared with connected platforms (Instagram, Facebook, LinkedIn, X)
- Platform APIs receive necessary data for content posting
- Each platform governed by their respective privacy policies

**Service Providers**
- Payment processing handled by Stripe (subject to Stripe's privacy policy)
- Cloud hosting providers for secure data storage
- Analytics services for service performance monitoring
- Email service providers for customer communications

**Legal Requirements**
- Information disclosed when required by law or court order
- Data shared to protect INEXASLI's legal rights and interests
- Information provided to investigate potential fraud or security breaches

**Business Transfers**
- Information may be transferred in connection with business mergers or acquisitions
- Clients notified of any ownership changes affecting data handling
- Privacy commitments maintained through business transitions`
        },
        {
            title: "Data Security",
            content: `**Technical Safeguards**
- All data encrypted in transit using industry-standard protocols
- Business information stored in encrypted databases
- Social media access tokens secured using OAuth 2.0 standards
- Regular security audits and vulnerability assessments

**Access Controls**
- Limited employee access to client data on need-to-know basis
- Multi-factor authentication required for system access
- Regular access reviews and permission updates
- Secure deletion procedures for terminated access

**Monitoring and Response**
- Continuous monitoring for security threats and anomalies
- Incident response procedures for potential data breaches
- Regular backup procedures to prevent data loss
- 24/7 security monitoring and alerting systems`
        },
        {
            title: "Your Rights and Controls",
            content: `**Data Access and Portability**
- Request copies of your business data at any time
- Export posted content and engagement analytics
- Receive data in commonly used, machine-readable formats
- Access service configuration and preference settings

**Data Correction and Updates**
- Update business information and brand guidelines
- Modify content preferences and posting schedules
- Correct inaccurate information in your business profile
- Update contact and billing information

**Data Deletion**
- Request deletion of business data from INEXASLI systems
- Remove social media account connections
- Delete historical posting data and analytics
- Note: Posted content on social media platforms remains (your property)

**Service Controls**
- Pause or resume automation services
- Modify posting schedules and content preferences
- Add or remove connected social media platforms
- Emergency stop controls for immediate posting halt`
        },
        {
            title: "Contact Information",
            content: `For questions about this Privacy Policy or our data practices:

**Email:** privacy@inexasli.com
**Website:** https://inexasli.com

**Data Protection Officer**
For GDPR-related inquiries: dpo@inexasli.com

**Response Time**
We respond to privacy inquiries within 5 business days and fulfill data requests within 30 days as required by applicable privacy laws.`
        }
    ]
};

// CSS styles for the modal
function createLegalSocialModal() {
    const sectionsHtml = generateSectionsHtml(TERMS_OF_SERVICE.sections);
    
    const htmlContent = `
        <div class="markdown-content" style="text-align: left; font-family: 'Inter', sans-serif; width: 100%; max-height: 70vh; overflow-y: auto;">
            <h2 style="color: #2d5a3d; margin-top: 0; margin-bottom: 16px; font-size: 1.2em; font-family: 'Geist', sans-serif; text-align: center; line-height: 1.2;">${TERMS_OF_SERVICE.title}</h2>
            <div style="background: rgba(255, 193, 7, 0.1); border: 2px solid rgba(255, 193, 7, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px; font-style: italic; color: #b8860b; font-size: 0.9em;">${TERMS_OF_SERVICE.disclaimer}</div>
            ${sectionsHtml}
        </div>
    `;

    window.openCustomModal(htmlContent, {
        maxWidth: '500px',
        onOpen: function(modal, modalContent) {
            // Add scroll function to modal context
            window.scrollToSection = function(sectionId) {
                const section = modalContent.querySelector(`#${sectionId}`);
                if (section) {
                    section.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            };
        }
    });
}

function createPrivacyModal() {
    const sectionsHtml = generateSectionsHtml(PRIVACY_POLICY.sections);
    
    const htmlContent = `
        <div class="markdown-content" style="text-align: left; font-family: 'Inter', sans-serif; width: 100%; max-height: 70vh; overflow-y: auto;">
            <h2 style="color: #2d5a3d; margin-top: 0; margin-bottom: 16px; font-size: 1.2em; font-family: 'Geist', sans-serif; text-align: center; line-height: 1.2;">${PRIVACY_POLICY.title}</h2>
            ${sectionsHtml}
        </div>
    `;

    window.openCustomModal(htmlContent, {
        maxWidth: '500px'
    });
}

function generateSectionsHtml(sections) {
    let sectionsHtml = '';
    sections.forEach((section, index) => {
        sectionsHtml += `
            <div id="section-${index}" style="margin-bottom: 16px; scroll-margin-top: 20px;">
                <h3 style="color: #2d5a3d; margin: 0 0 8px 0; font-size: 1.1em; font-family: 'Geist', sans-serif;">${index + 1}. ${section.title}</h3>
                <div style="font-size: 0.95em; line-height: 1.5; color: #333; white-space: pre-line;">${section.content}</div>
            </div>
        `;
    });
    return sectionsHtml;
}

// Show Terms of Service
function showSocialTerms() {
    console.log('[LegalSocial] Opening Terms of Service modal');
    return createLegalSocialModal();
}

// Show Privacy Policy
function showSocialPrivacy() {
    console.log('[LegalSocial] Opening Privacy Policy modal');
    return createPrivacyModal();
}

/**
 * Public API functions for external access
 */
function openSocialLegalModal() {
    console.log('[LegalSocial] Opening Terms of Service modal');
    return createLegalSocialModal();
}

function openSocialPrivacyModal() {
    console.log('[LegalSocial] Opening Privacy Policy modal');
    return createPrivacyModal();
}

/**
 * Alternative function names for convenience
 */
function openSocialTermsOfService() {
    return openSocialLegalModal();
}

function showSocialTermsOfService() {
    return openSocialLegalModal();
}

// Global functions for external access
window.showSocialTerms = showSocialTerms;
window.showSocialPrivacy = showSocialPrivacy;
window.openSocialLegalModal = openSocialLegalModal;
window.openSocialPrivacyModal = openSocialPrivacyModal;
window.openSocialTermsOfService = openSocialTermsOfService;
window.showSocialTermsOfService = showSocialTermsOfService;

console.log('[LegalSocial] Legal functions loaded successfully');
