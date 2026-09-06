const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const route = `
// Gemini Chat Support Route
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "Gemini AI is not configured on this server." });
    }

    // Convert local history to GenAI history format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-1.5-flash',
      history: formattedHistory,
      config: {
        systemInstruction: "You are the Vitality AI Assistant, a helpful guide for the Ministry of Health & Family Welfare's Command & Surveillance dashboard. You help users understand UI elements, logistics, clinical terms, and epidemic alerts. Keep answers concise, helpful, and professional.",
      }
    });

    const response = await chat.sendMessage({ message });
    
    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message', message: error?.message });
  }
});

// Generic Express error handler
`;

code = code.replace(/\/\/ Generic Express error handler/, route);

fs.writeFileSync('server.ts', code);
console.log('Added /api/gemini/chat route to server.ts');
