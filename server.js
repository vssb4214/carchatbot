const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/respond', async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: 'Failed to fetch Gemini response' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gemini-powered chatbot running at http://localhost:${PORT}`));
