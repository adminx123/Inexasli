# INEXASLI Sales Flow Documentation
*Complete End-to-End User Journey for Instagram Business API Integration*

## Overview
INEXASLI is a B2B social media automation platform that helps small to medium businesses automate their Instagram posting using AI-generated content. The platform uses Instagram Business API permissions (`instagram_business_basic` and `instagram_business_content_publish`) to provide managed automation services.

## Complete Sales Flow Journey

### Phase 1: Customer Acquisition & Interest Generation
**File:** `/business/social.html`

1. **Landing Page Experience**
   - Customer arrives at social media automation landing page
   - Hero section emphasizes "Automate Your Social Media While You Sleep"
   - Social proof displayed with business statistics
   - Limited time offer (50% off setup fee) creates urgency
   - Clear value proposition: "Turn 5 hours of daily work into 5 minutes of setup"

2. **Educational Content**
   - Benefits explained (AI content generation, automated posting, professional management)
   - Platform demonstrations and sample content
   - Testimonials and case studies from existing clients

3. **Call-to-Action**
   - "Get Started" button leads to package selection
   - Trust indicators (security badges, testimonials)

**Customer Decision Point:** Interest in automation service → Proceed to package selection

---

### Phase 2: Package Selection & Configuration
**File:** `/business/packages.html`

**Step 1/4: Base Package Selection**

1. **Package Options Presented**
   - **Starter Base:** $397 (Setup + First Month)
     - 15 photos, 5 videos, Instagram + 1 platform
   - **Professional Base:** $597 (Setup + First Month)  
     - 25 photos, 10 videos, Instagram + X + Facebook
   - **Enterprise Base:** $997 (Setup + First Month)
     - 50 photos, 20 videos, all platforms + premium features

2. **Feature Comparison**
   - Clear breakdown of what's included in each package
   - AI content generation capabilities
   - Platform coverage
   - Professional management included

3. **Package Selection**
   - Customer selects base package
   - Package details stored for quote generation
   - Progress indicator shows "Step 1 of 4" completed

**Customer Decision Point:** Base package selected → Proceed to enhancements

---

### Phase 3: Enhancement & Add-ons
**File:** `/business/addons.html`

**Step 2/4: Enhancement Selection**

1. **Selected Package Summary**
   - Display chosen base package details
   - Show pricing and features included

2. **Optional Enhancements Available**
   - Extra Photo Packs (+10, +25, +50 photos)
   - Extra Video Packs (+5, +10, +20 videos)
   - Additional Platform Integrations
   - Premium AI Features
   - Express Delivery Options
   - Custom Branding Services

3. **Enhancement Selection Process**
   - Customer can select multiple add-ons
   - Real-time price calculation
   - Each enhancement clearly explained with benefits

4. **Flexibility Options**
   - Option to skip all enhancements
   - Clear pricing for each add-on
   - Total cost updated dynamically

**Customer Decision Point:** Enhancements selected (or skipped) → Proceed to order review

---

### Phase 4: Order Review & Confirmation  
**File:** `/business/quote.html`

**Step 3/4: Review Your Order**

1. **Complete Order Summary**
   - Base package details and pricing
   - All selected enhancements with individual pricing
   - Subtotal, taxes, and total cost
   - Clear breakdown of what customer will receive

2. **Service Details Confirmation**
   - Content creation schedule
   - Platform posting frequency  
   - Management and support included
   - Setup timeline expectations

3. **Final Review Process**
   - Customer can modify selections (return to previous steps)
   - Terms of service acknowledgment
   - Service level agreement preview

4. **Order Confirmation**
   - Final price locked in
   - Customer confirms they understand the service
   - Proceed to payment authorization

**Customer Decision Point:** Order confirmed → Proceed to payment

---

### Phase 5: Payment Processing
**File:** `/business/payment.html`

**Step 4/4: Complete Your Order**

1. **Secure Payment Interface**
   - Stripe-powered payment processing
   - Order summary displayed one final time
   - Secure payment form with credit card details
   - SSL security indicators visible

2. **Payment Information Collection**
   - Credit card number, expiry, CVV
   - Billing address information
   - Payment method validation

3. **Payment Authorization**
   - Stripe processes payment securely
   - Real-time payment verification
   - Payment confirmation or error handling

4. **Order Completion**
   - Payment successful confirmation
   - Order number generated
   - Customer receipt sent via email

**Customer Decision Point:** Payment completed → Service setup begins

---

### Phase 6: Service Setup & Instagram OAuth
**File:** `/business/setupComplete.html` → `/business/oauth-connect.html`

**Post-Payment Service Activation**

1. **Setup Confirmation Page**
   - Payment success confirmation
   - Service activation initiated  
   - Customer onboarding process begins
   - Timeline for setup completion provided

2. **Instagram Business Account Connection**
   - Customer directed to Instagram OAuth integration
   - **CRITICAL STEP FOR APP REVIEW:** This is where Instagram Business API permissions are requested
   
3. **OAuth Connection Process** (`/business/oauth-connect.html`)

   **Step A: Instagram OAuth Introduction**
   - Page explains why Instagram connection is needed
   - Clear explanation: "To create and publish content to your Instagram Business account"
   - Security and privacy reassurances provided
   - Information about permissions being requested

   **Step B: Instagram OAuth Authorization** 
   - Customer clicks "Connect Instagram Business Account" button
   - Redirected to Instagram's official authorization page (`instagram.com` domain)
   - **Instagram's OAuth Flow:**
     - Customer logs into their Instagram account
     - Instagram displays permission request for:
       - `instagram_business_basic`: Access to basic business account info
       - `instagram_business_content_publish`: Create and publish posts/stories
     - Customer approves or denies permission request
   
   **Step C: OAuth Callback Processing**
   - Upon approval, Instagram redirects back to: `https://oauth.4hm7q4q75z.workers.dev/oauth/instagram/callback`
   - Authorization code processed securely
   - Access token obtained and stored encrypted in Cloudflare KV
   - Customer returned to setup completion page

4. **Additional Platform Connections** (if selected in package)
   - X (Twitter) OAuth integration (similar process)
   - Facebook Business OAuth integration
   - Each platform requires separate authorization

**Customer Decision Point:** Social media accounts connected → Service fully activated

---

### Phase 7: Service Activation & Ongoing Management
**File:** Service dashboard (future development)

1. **Account Setup Completion**
   - All selected social media accounts connected via OAuth
   - Customer's business information collected
   - Content preferences and brand guidelines established
   - Posting schedule configured

2. **AI Content Generation Begins**
   - INEXASLI AI systems analyze customer's business
   - Automated content creation using granted permissions:
     - `instagram_business_basic`: Retrieve account info for personalized content
     - `instagram_business_content_publish`: Create and schedule posts automatically
   - Content generated according to package specifications

3. **Ongoing Service Delivery**
   - Automated daily posting to Instagram (and other connected platforms)
   - AI-generated captions, hashtags, and visual content
   - Professional account management
   - Monthly performance reporting

4. **Customer Control & Management**
   - Customer can review and approve content before posting (optional)
   - Ability to revoke Instagram access anytime through Instagram settings
   - INEXASLI dashboard for managing preferences and viewing analytics
   - Direct customer support for modifications and requests

---

## Instagram Business API Use Case Summary

### Primary Use Case: B2B Social Media Automation Service

**Business Model:** INEXASLI provides managed social media automation to small and medium businesses who purchase access to our AI-powered posting service.

**Target Customers:** Business owners who want to maintain active social media presence but lack time or expertise to create and post content consistently.

**Instagram API Integration:**

1. **`instagram_business_basic` Permission Usage:**
   - Retrieve basic business account information for personalized content creation
   - Access business profile data to understand brand context
   - Obtain account insights for performance optimization
   - Used for account verification and service customization

2. **`instagram_business_content_publish` Permission Usage:**
   - Create and publish photo posts with AI-generated captions
   - Schedule and publish Instagram Stories for engagement
   - Post carousel content with multiple images
   - Publish video content and Reels for increased reach
   - All content created by INEXASLI AI systems on behalf of business clients

**Data Handling & Privacy:**
- Only store access tokens with explicit user consent through OAuth flow
- No storage of user passwords or sensitive personal information  
- Users maintain full control and can revoke access anytime
- GDPR compliant data handling practices
- Encrypted token storage in Cloudflare KV

**OAuth Implementation:**
- Standard OAuth 2.0 flow through Meta's official authorization endpoints
- Secure callback handling via Cloudflare Workers
- State parameter validation for security
- Token refresh handling for long-term access

---

## App Review Screencast Requirements

Based on Instagram's feedback, the screencast must demonstrate:

### Required Screencast Elements:

1. **Complete Meta Login Flow**
   - Show customer accessing `/business/oauth-connect.html`
   - Click "Connect Instagram Business Account" button
   - Demonstrate redirection to official Instagram authorization page
   - Show user login process on Instagram's domain
   - Display permission request screen with both requested permissions
   - Show user approving permission grants

2. **Permission Grant Demonstration**
   - Clearly show `instagram_business_basic` permission request
   - Clearly show `instagram_business_content_publish` permission request  
   - Demonstrate user clicking "Allow" or "Authorize"
   - Show successful authorization confirmation

3. **End-to-End Use Case Experience**
   - Start from business customer purchasing service (`/business/social.html`)
   - Progress through entire sales flow (packages → addons → quote → payment)
   - Complete payment process successfully
   - Demonstrate Instagram OAuth connection as part of service setup
   - Show how authorized permissions enable AI content creation and posting
   - Demonstrate actual content being published to connected Instagram account

4. **Best Practices Implementation**
   - Use English language throughout interface
   - Provide clear captions explaining each step
   - Add tooltips and explanations for all UI elements
   - Narrate the business purpose of each permission
   - Explain how each step benefits the business customer

### Screencast Narrative Structure:
1. Business owner discovers INEXASLI social media automation service
2. Customer selects package and completes purchase
3. Service setup requires Instagram connection for automation
4. Customer authorizes Instagram Business API permissions
5. AI system uses permissions to create and publish content automatically
6. Business owner benefits from automated social media presence

---

## Technical Implementation Notes

**OAuth Worker Configuration:**
- **Domain:** `https://oauth.4hm7q4q75z.workers.dev`
- **Start Endpoint:** `/oauth/instagram/start`  
- **Callback Endpoint:** `/oauth/instagram/callback`
- **App ID:** 1430248878244997 (for production OAuth)

**Required Instagram App Configuration:**
- Valid OAuth redirect URIs configured in Instagram Developer Console
- App review submission must include complete use case documentation
- Privacy policy and terms of service publicly accessible
- App categorization: "Business" with "Social Media Management" use case

**Security Implementation:**
- CSRF protection via state parameter validation
- Encrypted token storage in Cloudflare KV
- HTTPS enforcement across all endpoints
- Token rotation and refresh handling
- User consent logging and audit trails

---

## Key Success Metrics

**For Instagram App Review:**
- Clear demonstration of legitimate business use case
- Complete OAuth flow properly implemented
- End-to-end user experience documented
- Compliance with Meta Platform Policies demonstrated
- Professional presentation of automation service value

**For Business Operations:**
- Streamlined customer acquisition through sales flow
- Reduced manual setup time via automated OAuth integration  
- Scalable service delivery through API automation
- Customer satisfaction through consistent content delivery
- Revenue growth through tiered packaging model

---

This comprehensive sales flow documentation provides the complete end-to-end journey that Instagram's app review team needs to see, demonstrating legitimate business use of the requested permissions within a professional B2B automation service context.
