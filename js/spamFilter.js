// Filename: spamFilter.js | Path: C:\Users\cyber\Downloads\Dannisonfitness\js\spamFilter.js
// Spam detection utility for contact form submissions

/**
 * SpamFilter - Client-side spam detection for contact forms
 * Detects common spam patterns including:
 * - SEO/marketing solicitations
 * - Suspicious email patterns
 * - Excessive URLs in messages
 * - Bot-like submission behavior
 */

// Spam keywords commonly found in unsolicited marketing emails
const SPAM_KEYWORDS = [
    // SEO/Marketing spam
    'seo services', 'seo agency', 'search engine optimization',
    'improve your seo', 'boost your ranking', 'first page of google',
    'top of google', 'google ranking', 'search ranking',
    'backlinks', 'link building', 'domain authority',
    'website traffic', 'organic traffic', 'increase traffic',
    'marketing agency', 'digital marketing services',
    'web design services', 'redesign your website',

    // Cold outreach patterns
    'we have completed', 'review of your website',
    'noticed your website', 'found your website',
    'struggling to appear', 'visibility on search',
    'reply to this email', 'suitable time for a call',
    'schedule a call', 'book a call with',
    'free consultation', 'free audit', 'free analysis',

    // Financial/Crypto spam
    'cryptocurrency', 'bitcoin investment', 'forex trading',
    'passive income', 'make money online', 'work from home opportunity',

    // Generic spam phrases
    'dear sir/madam', 'dear webmaster', 'dear website owner',
    'to whom it may concern', 'i am contacting you',
    'we are a leading', 'we specialize in'
];

// Suspicious email domain patterns (disposable/spam domains)
const SUSPICIOUS_EMAIL_PATTERNS = [
    /^[a-z]{2,4}\d{5,}@/i,                    // Random letters + many numbers
    /@(tempmail|throwaway|guerrillamail|mailinator|10minutemail)/i,
    /\.(xyz|top|click|loan|work|date|racing|download|stream)$/i,
    /^[a-z0-9]{15,}@/i                        // Very long random string before @
];

/**
 * Check if a message contains spam keywords
 * @param {string} message - The message content to check
 * @returns {Object} - { isSpam: boolean, matchedKeyword: string|null }
 */
export function checkSpamKeywords(message) {
    if (!message) return { isSpam: false, matchedKeyword: null };

    const lowerMessage = message.toLowerCase();

    for (const keyword of SPAM_KEYWORDS) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
            return { isSpam: true, matchedKeyword: keyword };
        }
    }

    return { isSpam: false, matchedKeyword: null };
}

/**
 * Check if email has suspicious patterns
 * @param {string} email - Email address to check
 * @returns {boolean} - True if email looks suspicious
 */
export function checkSuspiciousEmail(email) {
    if (!email) return false;

    for (const pattern of SUSPICIOUS_EMAIL_PATTERNS) {
        if (pattern.test(email)) {
            return true;
        }
    }

    return false;
}

/**
 * Count URLs in a message
 * @param {string} message - Message content
 * @returns {number} - Number of URLs found
 */
export function countUrls(message) {
    if (!message) return 0;

    // Match common URL patterns
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|org|io|co|biz|info)[^\s]*)/gi;
    const matches = message.match(urlPattern);

    return matches ? matches.length : 0;
}

/**
 * Check if form was submitted too quickly (bot behavior)
 * @param {number} formLoadTime - Timestamp when form was loaded
 * @param {number} minSeconds - Minimum seconds expected for human to fill form
 * @returns {boolean} - True if submitted suspiciously fast
 */
export function checkSubmissionSpeed(formLoadTime, minSeconds = 3) {
    if (!formLoadTime) return false;

    const now = Date.now();
    const elapsedSeconds = (now - formLoadTime) / 1000;

    return elapsedSeconds < minSeconds;
}

/**
 * Check if honeypot field was filled (bots typically fill all fields)
 * @param {string} honeypotValue - Value of the hidden honeypot field
 * @returns {boolean} - True if honeypot was filled (likely a bot)
 */
export function checkHoneypot(honeypotValue) {
    return honeypotValue && honeypotValue.trim().length > 0;
}

/**
 * Main spam detection function - checks all spam indicators
 * @param {Object} formData - Form data object
 * @param {string} formData.message - Message content
 * @param {string} formData.email - Email address
 * @param {string} formData.honeypot - Honeypot field value
 * @param {number} formLoadTime - Timestamp when form was loaded
 * @returns {Object} - { isSpam: boolean, reason: string, confidence: 'high'|'medium'|'low' }
 */
export function detectSpam(formData, formLoadTime) {
    const { message, email, honeypot } = formData;

    // Check 1: Honeypot (high confidence - definitely a bot)
    if (checkHoneypot(honeypot)) {
        return {
            isSpam: true,
            reason: 'Automated submission detected',
            confidence: 'high'
        };
    }

    // Check 2: Submission speed (high confidence for very fast submissions)
    if (checkSubmissionSpeed(formLoadTime, 2)) {
        return {
            isSpam: true,
            reason: 'Form submitted too quickly',
            confidence: 'high'
        };
    }

    // Check 3: Spam keywords in message (medium-high confidence)
    const keywordCheck = checkSpamKeywords(message);
    if (keywordCheck.isSpam) {
        return {
            isSpam: true,
            reason: `Message contains promotional content`,
            confidence: 'medium'
        };
    }

    // Check 4: Excessive URLs in message (medium confidence)
    const urlCount = countUrls(message);
    if (urlCount >= 2) {
        return {
            isSpam: true,
            reason: 'Message contains too many links',
            confidence: 'medium'
        };
    }

    // Check 5: Suspicious email patterns (medium confidence)
    if (checkSuspiciousEmail(email)) {
        return {
            isSpam: true,
            reason: 'Suspicious email address detected',
            confidence: 'medium'
        };
    }

    // No spam indicators found
    return {
        isSpam: false,
        reason: null,
        confidence: null
    };
}

// Export for use in database.js
export default {
    detectSpam,
    checkSpamKeywords,
    checkSuspiciousEmail,
    countUrls,
    checkSubmissionSpeed,
    checkHoneypot
};
