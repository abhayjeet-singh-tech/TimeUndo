import dotenv from "dotenv";
dotenv.config({ path: ".env" });

console.log("API Key loaded:", !!process.env.GOOGLE_GEMINI_API_KEY);

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function runTest() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in 3 different languages.");
    console.log("Gemini Response:", result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

runTest();