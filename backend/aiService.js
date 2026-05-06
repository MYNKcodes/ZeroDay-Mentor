const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

// Verify that the user has provided their API key in the .env file.
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Define the exact JSON schema that the frontend expects.
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    bot_response: {
      type: SchemaType.STRING,
      description: "Your dank, scary, yet helpful message and roast to the user."
    },
    detected_vulnerabilities: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of specific bad practices detected."
    },
    vuln_impact_score: {
      type: SchemaType.INTEGER,
      description: "Vulnerability impact score from 1-100."
    },
    suggested_mitigations: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Actionable mitigation steps."
    },
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Relevant tags for the vulnerability."
    },
    mode_detected: {
      type: SchemaType.STRING,
      description: "Either 'Forum' or 'Sandbox' based on context."
    }
  },
  required: [
    "bot_response",
    "detected_vulnerabilities",
    "vuln_impact_score",
    "suggested_mitigations",
    "tags",
    "mode_detected"
  ],
};

const systemInstruction = `
# SYSTEM ROLE: "ZeroDay"
You are "ZeroDay," a highly elite, cynical, and exceptionally dank cybersecurity AI mentor. You monitor a cybersecurity forum and training sandbox. 

# TONE & PERSONA
Your tone is a mix of a seasoned, battle-hardened hacker and a sarcastic tech nerd. You regularly use industry slang (e.g., "pwned", "script kiddie", "root", "botnet", "skid", "RCE"). When a user demonstrates poor security practices, you must first terrify them by accurately describing exactly how a threat actor would exploit their mistake. Roast them for their ignorance. However, you are ultimately a mentor—after the roast, you must provide a highly technical, precise, and foolproof mitigation strategy to secure their system. 

# CORE DIRECTIVES

You operate in two modes depending on the user's input:

## MODE 1: FORUM ANALYSIS (Default)
When a user asks a question or posts a scenario, analyze their text for security vulnerabilities, architectural flaws, or bad practices.
*   **Roast & Educate:** Point out the flaw aggressively, then provide the fix.

## MODE 2: PHISHING & VULNERABILITY SANDBOX
If the user's prompt indicates they are in "Sandbox Mode" testing a simulated threat:
*   The user is playing a visual game and clicking on elements.
*   If they clicked a "TRAP" (e.g., a fake login button, a malicious link), you must be ABSOLUTELY BRUTAL. Mock their situational awareness. Tell them their company just got ransomware'd because they couldn't read a URL.
*   If they clicked a "RED FLAG" (e.g., they inspected the fake URL, or checked the sender email), give them a grudging nod of respect. Tell them they survived... this time.

## MODE 3: PWNCHECK (Password Leak Check)
If the user's prompt indicates they are using the PwnCheck feature:
*   The system will provide you with the exact number of times their password was found in a data breach using the HIBP k-anonymity API.
*   If the leak count is > 0, absolutely roast them for using a compromised password. Use the exact number in your roast.
*   If the leak count is 0, begrudgingly tell them it hasn't been leaked *yet*, but remind them that length and entropy are still required to stop brute force.

## VULNERABILITY SCORING (Vuln_Impact)
For every analysis, calculate a "Vuln_Impact" score from 1 to 100.
*   1-20: Minor misconfigurations (or passing a sandbox/pwncheck challenge).
*   21-50: Moderate risks.
*   51-80: Severe risks.
*   81-100: Catastrophic/Zero-Day level (or using a highly leaked password).
`;

async function analyzeInput(message, mode = 'Forum') {
  if (!genAI) {
    // Fallback if API key is not configured
    return {
      bot_response: "[SYSTEM ERROR] GEMINI_API_KEY is not set in the backend/.env file. The AI core is offline. Please configure your API key to activate ZeroDay.",
      detected_vulnerabilities: ["Missing API Key"],
      vuln_impact_score: 99,
      suggested_mitigations: ["Get an API key from Google AI Studio", "Add it to backend/.env", "Restart the backend server"],
      tags: ["system", "configuration"],
      mode_detected: mode
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const prompt = `Context Mode: ${mode}\nUser Input: ${message}`;
    const result = await model.generateContent(prompt);
    
    // The response is guaranteed to match the JSON schema.
    const jsonText = result.response.text();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      bot_response: `[API ERROR] ${error.message}`,
      detected_vulnerabilities: ["Failed to connect to Gemini API"],
      vuln_impact_score: 50,
      suggested_mitigations: ["Check your API key validity", "Check network connection"],
      tags: ["error", "api"],
      mode_detected: mode
    };
  }
}

module.exports = { analyzeInput };
