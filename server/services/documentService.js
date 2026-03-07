const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { getAIResponse } = require('./aiService');

// ========================
// TEXT EXTRACTION
// ========================

// Extract text from PDF
const extractFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('❌ PDF extraction failed:', error.message);
    throw new Error('Failed to extract text from PDF');
  }
};

// Extract text from DOCX
const extractFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('❌ DOCX extraction failed:', error.message);
    throw new Error('Failed to extract text from DOCX');
  }
};

// Extract text from TXT
const extractFromTXT = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('❌ TXT extraction failed:', error.message);
    throw new Error('Failed to read text file');
  }
};

// Main extraction router
const extractText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    return await extractFromPDF(filePath);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return await extractFromDOCX(filePath);
  } else if (mimeType === 'text/plain' || mimeType === 'text/csv') {
    return extractFromTXT(filePath);
  } else {
    throw new Error(`Unsupported file type for text extraction: ${mimeType}`);
  }
};

// ========================
// AI DOCUMENT ANALYSIS
// ========================

const analyzeDocument = async (extractedText, language = 'en') => {
  const analysisPrompt = `You are JurisPilot AI analyzing a legal document. Analyze the following document text and provide a structured analysis.

DOCUMENT TEXT:
"""
${extractedText.substring(0, 4000)}
"""

Provide your analysis in the following JSON format ONLY (no extra text, no markdown):
{
  "summary": "A plain language summary of the document (2-3 paragraphs, no legal jargon)",
  "riskIndicators": [
    {
      "clause": "The specific clause text or reference",
      "risk": "low/medium/high",
      "explanation": "Why this is a risk"
    }
  ],
  "clauseBreakdown": [
    {
      "title": "Clause name or section",
      "content": "What the clause says",
      "implication": "What it means for the user"
    }
  ],
  "legalImplications": "Overall legal implications for the user",
  "recommendation": "What the user should do next"
}

${language === 'hi' ? 'Respond in Hindi (Devanagari script).' : 'Respond in simple English.'}
Return ONLY valid JSON, no other text.`;

  const result = await getAIResponse(analysisPrompt, language);

  // Parse the AI response as JSON
  try {
    // Clean the response — remove markdown code blocks if present
    let cleanResponse = result.response;
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysis = JSON.parse(cleanResponse);
    return {
      analysis,
      provider: result.provider,
    };
  } catch (parseError) {
    // If JSON parsing fails, return raw text as summary
    console.log('⚠️ AI response not valid JSON, using as raw summary');
    return {
      analysis: {
        summary: result.response,
        riskIndicators: [],
        clauseBreakdown: [],
        legalImplications: 'Please review the summary above for details.',
        recommendation: 'Consider consulting a verified lawyer for detailed analysis.',
      },
      provider: result.provider,
    };
  }
};

// ========================
// LEGAL NOTICE GENERATION
// ========================

const generateLegalNotice = async (noticeData, language = 'en') => {
  const noticePrompt = `You are JurisPilot AI. Generate a formal legal notice based on the following details.

SENDER:
- Name: ${noticeData.sender.name}
- Address: ${noticeData.sender.address}

RECIPIENT:
- Name: ${noticeData.recipient.name}
- Address: ${noticeData.recipient.address}

SUBJECT: ${noticeData.subject}

INCIDENT DESCRIPTION:
${noticeData.incidentDescription}

LEGAL CLAIM:
${noticeData.legalClaim}

DESIRED RESOLUTION:
${noticeData.desiredResolution}

RESPONSE DEADLINE: ${noticeData.deadline} days

Generate a complete, formal legal notice that includes:
1. DATE and REFERENCE NUMBER
2. SUBJECT LINE
3. FORMAL SALUTATION
4. FACTUAL BACKGROUND (recounting the incident)
5. LEGAL BASIS (citing relevant Indian laws, sections, acts)
6. DEMAND/RELIEF SOUGHT
7. CONSEQUENCES OF NON-COMPLIANCE
8. RESPONSE DEADLINE
9. FORMAL CLOSING with sender's details

${language === 'hi' ? 'Generate the notice in Hindi (Devanagari script) with legal terms in English where necessary.' : 'Generate in formal legal English.'}

Make it professionally worded, legally sound, and ready for review by a lawyer.`;

  const result = await getAIResponse(noticePrompt, language);

  return {
    generatedNotice: result.response,
    provider: result.provider,
    category: result.category,
  };
};

module.exports = {
  extractText,
  analyzeDocument,
  generateLegalNotice,
};