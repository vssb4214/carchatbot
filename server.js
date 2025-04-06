import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { conversation } = req.body;
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ reply: 'Invalid conversation format.' });
    }
    
   
    let prompt = "Answer briefly:\n";
    conversation.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `User: ${msg.text}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.text}\n`;
      }
    });
    prompt += 'Assistant:';  

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: prompt,
      maxOutputTokens: 100,  // answer limiter
      temperature: 0.2,
      candidateCount: 1,
    });

    const reply = response.text || "No reply received.";
    res.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ reply: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
