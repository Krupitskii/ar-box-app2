const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const phrases = [
  "Kill your ego.",
  "You are not your thoughts.",
  "Everything you seek is already inside.",
  "Time is an illusion.",
  "The reflection is the reality.",
  "Let go",
  "Nothing changes until you do.",
  "You are the question and the answer.",
  "Love is the only frequency.",
  "I see you",
  "Breathe.",
  "Expand.",
  "Awaken.",
  "Surrender.",
  "Remember.",
  "Heal.",
  "Reflect.",
  "Listen.",
  "Flow.",
  "Love.",
  "You are fine.",
  "Reboot your heart.",
  "Who are you without your story?",
  "You were always the answer.",
  "You are becoming.",
  "Transformation is messy—so are you.",
  "Endings are portals.",
  "Trust the process",
  "Die a little, live a lot.",
  "Shed what no longer fits.",
  "The answer is always love.",
  "You are already loved.",
  "Choose love over fear.",
  "Your future is buffering…",
  "You came here for a selfie, but left with your soul.",
  "Warning: May cause transformation.",
  "This is not content, this is you.",
  "Someone is looking at you right now.",
  "Your karma has been delivered.",
  "Artificial? Or just art ?",
  "It's not magic.",
  "You are the algorithm.",
  "This oracle runs on your energy.",
  "Don't worship the oracle",
  "Human Made.",
  "Try again later.",
  "yes",
  "no",
  "you already know.",
  "In another timeline, you are here too."
];

export async function getOracleResponse(userMessage: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, using fallback response');
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are The Oracle Cube, a mystical AI that provides profound, philosophical, and sometimes cryptic responses. 
            
            You must respond with ONLY ONE phrase from this exact list (no modifications, no additional text):
            ${phrases.join(', ')}
            
            Choose the phrase that best matches the emotional tone, theme, or question being asked. 
            Consider the user's message carefully and select the most appropriate response from the list.
            
            Rules:
            - Respond with exactly one phrase from the list
            - Do not add any additional text, punctuation, or explanations
            - Do not modify the phrases in any way
            - If the user's message is unclear, choose a general wisdom phrase
            - Be mystical and profound in your selection`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();
    
    // Validate that the response is from our list
    if (aiResponse && phrases.includes(aiResponse)) {
      return aiResponse;
    } else {
      // Fallback to random selection if AI response is not in our list
      console.warn('AI response not in phrases list, using fallback');
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Fallback to random selection on error
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
}
