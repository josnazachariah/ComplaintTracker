/**
 * Mock AI Service to simulate image and text analysis
 */

const CATEGORIES = [
    'Road Damage',
    'Garbage Overflow',
    'Streetlight Issue',
    'Water Leakage',
    'Drainage Blockage'
];

const DEPARTMENTS = {
    'Road Damage': 'Roads Department',
    'Garbage Overflow': 'Sanitation Department',
    'Streetlight Issue': 'Electricity Department',
    'Water Leakage': 'Water Authority',
    'Drainage Blockage': 'Sanitation Department'
};

const URGENCY_KEYWORDS = {
    critical: ['accident', 'danger', 'death', 'deadly', 'sinkhole', 'falling', 'fire', 'explosion'],
    high: ['broken', 'emergency', 'dangerous', 'flowing', 'flood', 'injuries', 'blocked road'],
    medium: ['smell', 'block', 'stopped', 'dark', 'pot hole', 'leak', 'overflow'],
    low: ['old', 'request', 'check', 'maintenance', 'fix', 'minor']
};

/**
 * Simulates analyzing an image to classify the issue.
 * Extracts keywords from the description to "simulate" what Vision AI would see.
 */
function analyzeImage(description, category) {
    const text = description.toLowerCase();

    // Heuristic: If certain words appear, AI "sees" it even if category is different
    if (text.includes('pothole') || text.includes('road')) return 'Road Damage';
    if (text.includes('trash') || text.includes('garbage') || text.includes('bins')) return 'Garbage Overflow';
    if (text.includes('light') || text.includes('dark') || text.includes('lamp')) return 'Streetlight Issue';
    if (text.includes('water') || text.includes('burst') || text.includes('pipe')) return 'Water Leakage';
    if (text.includes('drain') || text.includes('sewage') || text.includes('clog')) return 'Drainage Blockage';

    // If no clear match, return provided category or random
    return category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

/**
 * Simulates AI detecting emergency level and reasoning.
 */
function detectEmergency(description) {
    const text = description.toLowerCase();
    let score = 0;
    let reasoning = "Standard issue detected.";

    const criticalMatch = URGENCY_KEYWORDS.critical.find(word => text.includes(word));
    const highMatch = URGENCY_KEYWORDS.high.find(word => text.includes(word));

    if (criticalMatch) {
        score = 100;
        reasoning = `CRITICAL: Detected primary life-safety hazard (${criticalMatch}). Immediate dispatch suggested.`;
        return { priority: 'High', emergencyScore: score, reasoning };
    }

    if (highMatch) {
        score = 75;
        reasoning = `HIGH: Significant infrastructure failure detected (${highMatch}). High risk of escalation.`;
        return { priority: 'High', emergencyScore: score, reasoning };
    }

    const mediumMatch = URGENCY_KEYWORDS.medium.find(word => text.includes(word));
    if (mediumMatch) {
        score = 45;
        reasoning = `MEDIUM: Service disruption confirmed (${mediumMatch}). Scheduled maintenance required.`;
        return { priority: 'Medium', emergencyScore: score, reasoning };
    }

    return { priority: 'Low', emergencyScore: 10, reasoning };
}

function processComplaint(data) {
    // Simulate slight AI delay for "thoughtfulness"
    const detectedCategory = analyzeImage(data.description, data.category);
    const emergencyInfo = detectEmergency(data.description);
    const department = DEPARTMENTS[detectedCategory] || 'General Maintenance';

    return {
        detectedCategory,
        confidence: 0.85 + (Math.random() * 0.14), // Simulated high confidence
        priority: emergencyInfo.priority,
        emergencyScore: emergencyInfo.emergencyScore,
        reasoning: emergencyInfo.reasoning,
        department
    };
}

module.exports = {
    processComplaint,
    CATEGORIES
};
