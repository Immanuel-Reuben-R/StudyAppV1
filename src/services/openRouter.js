export const enhanceNotesWithAI = async (apiKey, rawNotes, learningStyle) => {
  if (!apiKey) throw new Error("OpenRouter API key is required");
  if (!rawNotes || rawNotes.trim() === "") throw new Error("No notes provided to enhance");

  const systemPrompt = `You are an expert tutor and note-organizer. 
Your goal is to take raw, messy notes from various sources and organize, group, and enhance them.
CRITICAL INSTRUCTION: You must tailor the final output to this specific learning style/persona: "${learningStyle}".
Format the output in clean, readable Markdown (headings, bullet points, bold key terms). Do not include pleasantries, just return the enhanced notes.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://studynotesapp.local", // Required by OpenRouter
        "X-Title": "Study Notes App", // Required by OpenRouter
      },
      body: JSON.stringify({
        // Defaulting to a very smart, fast model. We can make this selectable later!
        model: "anthropic/claude-3.5-sonnet", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here are my raw notes. Please enhance and organize them:\n\n${rawNotes}` }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to contact OpenRouter");
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI Enhancement Error:", error);
    throw error;
  }
};
