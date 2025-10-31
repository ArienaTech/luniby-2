// Triage management service
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/supabase-utils';
import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const triageService = {
  // Create a new triage case
  async createTriage(triageData) {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .insert([{
          ...triageData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Get triage case by ID
  async getTriage(triageId) {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .select('*')
        .eq('id', triageId)
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Get user's triage cases
  async getUserTriages(userId) {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: [] };
    }
  },

  // Update triage status
  async updateTriageStatus(triageId, status, notes = '') {
    try {
      const { data, error } = await supabase
        .from('triage_cases')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', triageId)
        .select()
        .single();

      if (error) {
        return { success: false, error: handleSupabaseError(error), data: null };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleSupabaseError(error), data: null };
    }
  },

  // Analyze completion criteria using AI with behavioral changes fix
  async analyzeCompletionCriteria(messages, openaiService, currentAnalysis = null) {
    // Fallback analysis using keyword matching (enhanced with behavioral changes fix)
    const fallbackAnalysis = this.analyzeWithFallback(messages, currentAnalysis);

    // If no OpenAI key, return fallback
    if (!OPENAI_API_KEY) {
      console.log('?? Using fallback analysis (no OpenAI key)');
      return fallbackAnalysis;
    }

    try {
      const conversationText = messages
        .map(msg => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are analyzing a pet health triage conversation to determine which information criteria have been collected.

CRITERIA TO DETECT (return true/false for each):

1. **petSpecies** - Has the user mentioned their pet's species? (dog, cat, rabbit, bird, etc.)

2. **petAge** - Has the user provided their pet's age or life stage? (puppy, kitten, senior, specific age, etc.)

3. **petConcerns** - Has the user described the main health concern or symptoms they're worried about?

4. **durationSymptoms** - Has the user indicated how long the symptoms have been present? (hours, days, weeks, "just started", "ongoing", etc.)

5. **eatingDrinking** - Has the user provided information about their pet's eating or drinking habits?

6. **behavioralChanges** - Has the user provided ANY information about their pet's behavior or activity level?
   IMPORTANT: This should be TRUE if user mentions:
   - Changes in behavior ("more lethargic", "less active", "hiding", "aggressive")
   - NO changes in behavior ("no changes", "acting normal", "same as usual", "behaving normally")
   - Simple responses about behavior ("none", "no", "nothing", "nope", "not really", "fine")
   - Activity level information ("playing normally", "still active", "resting more")

7. **medicalHistory** - Has the user mentioned any pre-existing conditions, past illnesses, medications, allergies, or previous vet visits?

DETECTION RULES:
- If the AI asked about a topic and user responded (even with "no", "none", "nothing"), mark it as TRUE
- Even negative responses ("no changes", "none") count as information provided
- Look at context: if AI asked "Any behavioral changes?" and user said "none" or "no", behavioralChanges = TRUE
- Be generous with detection - we want to avoid re-asking questions

Analyze this conversation and return ONLY a JSON object with this exact format:
{
  "petSpecies": boolean,
  "petAge": boolean,
  "petConcerns": boolean,
  "durationSymptoms": boolean,
  "eatingDrinking": boolean,
  "behavioralChanges": boolean,
  "medicalHistory": boolean,
  "emergencyDetected": boolean,
  "severity": "Critical" | "Urgent" | "Moderate" | "Routine" | null
}`;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Conversation:\n${conversationText}` }
          ],
          temperature: 0.3,
          max_tokens: 300
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          timeout: 15000
        }
      );

      const content = response.data.choices[0].message.content.trim();
      
      // Try to parse JSON from response
      let aiCriteria;
      try {
        // Remove markdown code blocks if present
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        aiCriteria = JSON.parse(jsonStr);
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback:', parseError);
        return fallbackAnalysis;
      }

      // Calculate progress
      const criteriaKeys = ['petSpecies', 'petAge', 'petConcerns', 'durationSymptoms', 'eatingDrinking', 'behavioralChanges', 'medicalHistory'];
      const completedCriteria = criteriaKeys.filter(key => aiCriteria[key]).length;
      const progressPercentage = Math.round((completedCriteria / criteriaKeys.length) * 100);

      // Determine stage
      let stage = 'Getting Started';
      if (completedCriteria >= 7) stage = 'Complete';
      else if (completedCriteria >= 5) stage = 'Finalizing';
      else if (completedCriteria >= 3) stage = 'In Progress';
      else if (completedCriteria >= 1) stage = 'Initial Assessment';

      const analysis = {
        criteria: {
          petSpecies: aiCriteria.petSpecies || false,
          petAge: aiCriteria.petAge || false,
          petConcerns: aiCriteria.petConcerns || false,
          durationSymptoms: aiCriteria.durationSymptoms || false,
          eatingDrinking: aiCriteria.eatingDrinking || false,
          behavioralChanges: aiCriteria.behavioralChanges || false,
          medicalHistory: aiCriteria.medicalHistory || false
        },
        completedCriteria,
        progressPercentage,
        stage,
        isComplete: completedCriteria >= 7,
        emergencyDetected: aiCriteria.emergencyDetected || false,
        severity: aiCriteria.severity || 'Moderate'
      };

      console.log('? AI-powered criteria analysis completed');
      return analysis;

    } catch (error) {
      console.error('Error in AI criteria analysis:', error);
      console.log('?? Falling back to keyword-based analysis');
      return fallbackAnalysis;
    }
  },

  // Fallback analysis using keyword matching (with behavioral changes fix)
  analyzeWithFallback(messages, currentAnalysis = null) {
    const userMessages = messages.filter(msg => msg.type === 'user');
    const aiMessages = messages.filter(msg => msg.type === 'ai');
    const allContent = messages.map(msg => msg.content).join(' ').toLowerCase();

    // Enhanced behavioral changes detection with fix
    const askedAboutBehavior = aiMessages.some(msg => 
      msg.content && /\b(behavior|activity|acting|routine|energy|changes in|behavioral)\b/i.test(msg.content)
    );

    const providedBehaviorInfo = userMessages.some(msg => 
      msg.content && (
        /\b(behavior|activity|acting|routine|lethargic|active|hiding|normal|changes|same|energetic|playful|withdrawn)\b/i.test(msg.content) ||
        // "no changes" responses when behavior was asked about (with enhanced patterns from patch)
        (askedAboutBehavior && /\b(no changes?|same|normal|usual|fine|none|nothing|nope|not really|no behavioral)\b/i.test(msg.content.toLowerCase()))
      )
    );

    // Criteria detection
    const criteria = {
      petSpecies: /\b(dog|cat|rabbit|bird|hamster|guinea pig|ferret|reptile|snake|lizard|turtle|fish|puppy|kitten)\b/i.test(allContent),
      petAge: /\b(\d+\s*(year|month|week)|old|age|puppy|kitten|senior|young|adult)\b/i.test(allContent),
      petConcerns: /\b(symptom|sick|ill|problem|concern|issue|vomit|diarrhea|cough|sneez|lump|limp|pain|bleed)\b/i.test(allContent),
      durationSymptoms: /\b(\d+\s*(day|hour|week|month)|since|started|began|ongoing|recently|yesterday|today|just now)\b/i.test(allContent),
      eatingDrinking: /\b(eat|drink|food|water|appetite|hungry|thirsty|meal|fed)\b/i.test(allContent),
      behavioralChanges: providedBehaviorInfo, // Enhanced detection with fix
      medicalHistory: /\b(medicine|medication|condition|surgery|illness|vet|vaccine|allerg|diagnos|treatment|chronic)\b/i.test(allContent)
    };

    // Emergency detection
    const emergencyKeywords = [
      'can\'t breathe', 'not breathing', 'choking', 'seizure', 'collapse', 'unconscious',
      'severe bleeding', 'hit by car', 'poisoned', 'toxic', 'bloat', 'can\'t urinate',
      'extreme pain', 'pale gums', 'blue tongue', 'distended abdomen'
    ];
    const emergencyDetected = emergencyKeywords.some(keyword => 
      allContent.includes(keyword.toLowerCase())
    );

    // Calculate progress
    const criteriaKeys = Object.keys(criteria);
    const completedCriteria = criteriaKeys.filter(key => criteria[key]).length;
    const progressPercentage = Math.round((completedCriteria / criteriaKeys.length) * 100);

    // Determine stage
    let stage = 'Getting Started';
    if (completedCriteria >= 7) stage = 'Complete';
    else if (completedCriteria >= 5) stage = 'Finalizing';
    else if (completedCriteria >= 3) stage = 'In Progress';
    else if (completedCriteria >= 1) stage = 'Initial Assessment';

    // Determine severity
    let severity = 'Moderate';
    if (emergencyDetected) {
      severity = 'Critical';
    } else if (/\b(severe|extreme|emergency|urgent|serious|critical)\b/i.test(allContent)) {
      severity = 'Urgent';
    } else if (/\b(mild|minor|slight|small)\b/i.test(allContent)) {
      severity = 'Routine';
    }

    return {
      criteria,
      completedCriteria,
      progressPercentage,
      stage,
      isComplete: completedCriteria >= 7,
      emergencyDetected,
      severity
    };
  }
};

export default triageService;
