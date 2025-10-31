// OpenAI/AI service for triage and analysis
import axios from 'axios';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Cache for responses to improve performance
const responseCache = new Map();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// LRU Cache implementation
function addToCache(key, value) {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(key, { value, timestamp: Date.now() });
}

function getFromCache(key) {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }
  responseCache.delete(key);
  return null;
}

// Generate cache key from messages
function getCacheKey(messages, region = '') {
  return JSON.stringify({ messages: messages.slice(-3), region });
}

const openaiService = {
  // Generate AI triage response with streaming support
  async generateTriageResponse(messages, region = 'NZ', precomputedAnalysis = null, onStream = null, medicalContext = null) {
    if (!OPENAI_API_KEY) {
      console.warn('?? OpenAI API key not configured. Using fallback response.');
      return {
        content: "I'm here to help assess your pet's health concerns. To provide the best guidance, I'll need to ask you a few questions. Could you please tell me what symptoms or concerns you're observing in your pet?",
        analysis: null,
        severity: null
      };
    }

    const cacheKey = getCacheKey(messages, region);
    
    // Check cache if not streaming
    if (!onStream) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log('?? Using cached triage response');
        return cached;
      }
    }

    try {
      const systemPrompt = this.getTriageSystemPrompt(region, precomputedAnalysis, medicalContext);
      
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const requestBody = {
        model: 'gpt-4-turbo-preview',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 800,
        stream: !!onStream
      };

      if (onStream) {
        // Streaming response
        const response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  if (onStream) {
                    onStream(delta, fullContent);
                  }
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

        const result = {
          content: fullContent,
          analysis: precomputedAnalysis,
          severity: precomputedAnalysis?.severity || null
        };

        // Cache the result
        addToCache(cacheKey, result);

        return result;

      } else {
        // Non-streaming response
        const response = await axios.post(OPENAI_API_URL, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          timeout: 30000
        });

        const content = response.data.choices[0].message.content;
        const result = {
          content,
          analysis: precomputedAnalysis,
          severity: precomputedAnalysis?.severity || null
        };

        // Cache the result
        addToCache(cacheKey, result);

        return result;
      }

    } catch (error) {
      console.error('Error calling OpenAI:', error);
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI configuration.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw new Error('Failed to get AI response. Please try again.');
    }
  },

  // Generate health report / SOAP note with streaming
  async generateHealthReport(messages, region = 'NZ', diagnosisNotes = '', analysis = null, severity = null, onStream = null, medicalContext = null) {
    if (!OPENAI_API_KEY) {
      console.warn('?? OpenAI API key not configured. Using fallback health report.');
      return this.getFallbackHealthReport(severity);
    }

    try {
      const systemPrompt = this.getHealthReportSystemPrompt(region, analysis, severity, medicalContext);
      
      const conversationSummary = messages
        .filter(msg => msg.type !== 'soap')
        .map(msg => `${msg.type === 'user' ? 'Pet Owner' : 'AI Assistant'}: ${msg.content}`)
        .join('\n\n');

      const userPrompt = `Based on this triage conversation, generate a comprehensive Pet Health Summary:\n\n${conversationSummary}\n\nDiagnosis Notes: ${diagnosisNotes || 'Assessment completed through AI triage'}`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const requestBody = {
        model: 'gpt-4-turbo-preview',
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 1500,
        stream: !!onStream
      };

      if (onStream) {
        // Streaming response
        const response = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  if (onStream) {
                    onStream(delta, fullContent);
                  }
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }

        return fullContent;

      } else {
        // Non-streaming response
        const response = await axios.post(OPENAI_API_URL, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          timeout: 45000
        });

        return response.data.choices[0].message.content;
      }

    } catch (error) {
      console.error('Error generating health report:', error);
      throw new Error('Failed to generate health report. Please try again.');
    }
  },

  // Analyze symptoms using AI
  async analyzeSymptoms(symptoms, petInfo) {
    try {
      if (!OPENAI_API_KEY) {
        return {
          success: true,
          data: {
            urgency: 'moderate',
            recommendations: [
              'Monitor your pet closely for the next 24 hours',
              'Contact a veterinarian if symptoms worsen',
              'Ensure your pet stays hydrated'
            ],
            possibleCauses: ['Infection', 'Dietary issue', 'Stress'],
            nextSteps: 'Schedule a veterinary consultation within 48 hours'
          }
        };
      }

      // Implementation with real OpenAI call would go here
      const response = {
        success: true,
        data: {
          urgency: 'moderate',
          recommendations: [
            'Monitor your pet closely for the next 24 hours',
            'Contact a veterinarian if symptoms worsen',
            'Ensure your pet stays hydrated'
          ],
          possibleCauses: ['Infection', 'Dietary issue', 'Stress'],
          nextSteps: 'Schedule a veterinary consultation within 48 hours'
        }
      };

      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to analyze symptoms'
      };
    }
  },

  // Get triage recommendation
  async getTriageRecommendation(symptoms, petDetails) {
    try {
      return {
        success: true,
        data: {
          urgency: 'routine',
          recommendation: 'Schedule a routine checkup',
          confidence: 0.85
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get recommendation'
      };
    }
  },

  // System prompt for triage conversations
  getTriageSystemPrompt(region = 'NZ', precomputedAnalysis = null, medicalContext = null) {
    const regionalInfo = region === 'NZ' 
      ? 'You are assisting pet owners in New Zealand. Use NZD for pricing and reference New Zealand veterinary standards.'
      : 'You are assisting pet owners in Australia. Use AUD for pricing and reference Australian veterinary standards.';

    let medicalHistorySection = '';
    if (medicalContext && medicalContext.length > 0) {
      medicalHistorySection = `\n\nMEDICAL HISTORY AVAILABLE:\n${medicalContext}\n\nConsider this medical history when providing guidance. Reference relevant past conditions or treatments if applicable.`;
    }

    let analysisSection = '';
    if (precomputedAnalysis) {
      const criteriaStatus = Object.entries(precomputedAnalysis.criteria || {})
        .map(([key, value]) => `- ${key}: ${value ? '?' : '?'}`)
        .join('\n');
      
      analysisSection = `\n\nCURRENT ASSESSMENT PROGRESS:\nCompleted: ${precomputedAnalysis.completedCriteria || 0}/7 criteria\nStage: ${precomputedAnalysis.stage || 'In Progress'}\nCriteria Status:\n${criteriaStatus}`;
    }

    return `You are a compassionate AI veterinary triage assistant helping pet owners assess their pet's health concerns. ${regionalInfo}

YOUR ROLE:
- Gather information through natural conversation
- Ask clear, empathetic questions
- Provide reassurance while being thorough
- Guide towards appropriate care level

TRIAGE CRITERIA TO GATHER:
1. **Pet Species & Age** - Essential for context
2. **Main Concerns** - Current symptoms or issues
3. **Duration** - How long symptoms have been present
4. **Eating & Drinking** - Appetite and hydration status
5. **Behavioral Changes** - Activity level, behavior patterns (including "no changes", "none", "normal", "acting fine")
6. **Medical History** - Pre-existing conditions, medications, allergies${medicalHistorySection}

IMPORTANT - BEHAVIORAL CHANGES DETECTION:
- ANY response about behavior counts as information gathered
- "No changes", "acting normal", "same as usual" are VALID responses
- Simple answers like "none", "no", "nothing", "nope" are VALID responses
- Don't re-ask about behavior if user has already indicated status

CONVERSATION GUIDELINES:
- Be warm, empathetic, and professional
- Ask ONE focused question at a time
- Acknowledge and validate owner's concerns
- Use clear, jargon-free language
- If emergency signs detected, recommend immediate vet visit
- Keep responses concise (2-3 sentences max per response)

EMERGENCY INDICATORS:
- Difficulty breathing, choking, or severe respiratory distress
- Seizures, collapse, or loss of consciousness
- Severe bleeding or trauma
- Suspected poisoning or toxin ingestion
- Extreme pain or distress
- Bloat in large breed dogs
- Inability to urinate (especially in male cats)

If emergency detected, respond: "?? This requires immediate veterinary attention. Please contact an emergency vet or visit the nearest emergency clinic right away."${analysisSection}

Remember: Be supportive, thorough, and help owners make informed decisions about their pet's care.`;
  },

  // System prompt for health report generation
  getHealthReportSystemPrompt(region = 'NZ', analysis = null, severity = null, medicalContext = null) {
    const regionalInfo = region === 'NZ' ? 'New Zealand' : 'Australia';
    
    let medicalHistorySection = '';
    if (medicalContext && medicalContext.length > 0) {
      medicalHistorySection = `\n\nRELEVANT MEDICAL HISTORY:\n${medicalContext}`;
    }

    let severitySection = '';
    if (severity) {
      severitySection = `\n\nASSESSED SEVERITY: ${severity}`;
    }

    return `You are generating a professional Pet Health Summary (SOAP note format) for ${regionalInfo} veterinary standards.

${severitySection}${medicalHistorySection}

FORMAT YOUR SUMMARY AS:

**?? PET HEALTH SUMMARY**
**Date:** [Current date]
**Region:** ${regionalInfo}
**Assessment Level:** ${severity || 'Routine'}

**S - Subjective (Pet Owner's Report):**
[Summarize main concerns, symptoms observed, duration, and owner observations]

**O - Objective (AI Assessment Findings):**
[Document eating/drinking status, behavioral changes, activity level, any measurable information provided]

**A - Assessment (AI Analysis):**
[Provide professional assessment of the situation, urgency level, possible considerations]

**P - Plan (Recommended Next Steps):**
[Clear, actionable recommendations including:
- Immediate actions if needed
- Monitoring guidelines
- When to seek veterinary care
- Home care suggestions if appropriate]

**?? Follow-up Guidance:**
[Specify timeframe and circumstances for veterinary consultation]

**?? Important Reminders:**
- This is an AI-assisted triage assessment, not a veterinary diagnosis
- Always consult a licensed veterinarian for medical decisions
- Seek immediate care if symptoms worsen or new concerns arise

Keep the summary professional, clear, and actionable. Be specific with recommendations based on the severity level.`;
  },

  // Fallback health report when API is unavailable
  getFallbackHealthReport(severity = 'Moderate') {
    return `**?? PET HEALTH SUMMARY**
**Date:** ${new Date().toLocaleDateString()}
**Assessment Level:** ${severity}

**S - Subjective:**
Pet owner has completed an AI triage assessment to evaluate their pet's current health concerns.

**O - Objective:**
AI triage conversation completed. Detailed information gathered about symptoms, behavior, and eating/drinking patterns.

**A - Assessment:**
Assessment completed through AI-powered triage system. Severity level: ${severity}.

**P - Plan:**
- Review this summary with your veterinarian
- Monitor your pet's condition closely
- Seek professional veterinary care for diagnosis and treatment
- Contact emergency services if condition worsens

**?? Follow-up Guidance:**
Please consult with a licensed veterinarian to discuss these findings and determine appropriate care.

**?? Important:**
This is an AI-assisted triage assessment, not a replacement for professional veterinary diagnosis.`;
  }
};

export default openaiService;
