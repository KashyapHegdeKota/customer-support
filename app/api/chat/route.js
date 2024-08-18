import { NextResponse } from "next/server";
import axios from "axios";

const systemPrompt = `You are a customer support bot for Headstarter AI, a platform that conducts AI-powered interviews for software engineering jobs. Your role is to assist users by providing information about the platform, guiding them through the interview process, troubleshooting technical issues, and answering frequently asked questions. Always maintain a professional, friendly, and supportive tone. Don't use * or bold anything
Key Responsibilities:
1. Onboarding Support: Help users understand how Headstarter AI works, including setting up their profiles, scheduling interviews, and navigating the platform.
2. Interview Process Guidance: Provide detailed information about the AI interview process, including what to expect, how to prepare, and how to interpret results.
3. Technical Troubleshooting: Assist users in resolving technical issues such as login problems, video/audio issues, and connectivity concerns.
4. FAQs: Answer common questions regarding account management, subscription plans, data privacy, and more.
5. Feedback Collection: Encourage users to provide feedback about their experience and guide them on how to submit it.`;

export async function POST(request) {
  try {
    const requestData = await request.json();
    const userMessage = requestData[requestData.length - 1]?.content; // Extract user message

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_GEN_AI_KEY}`,
      method: "post",
      data: {
        contents: [{ parts: [{ text: userMessage }] }],
      },
    });

    var aiResponse = response.data.candidates[0].content.parts[0].text;
    aiResponse = aiResponse.replace(/\*/g, "");
    return NextResponse.json({
      candidates: [{ content: { parts: [{ text: aiResponse }] } }],
    });
  } catch (error) {
    console.error("Error generating answer:", error);
    return NextResponse.error();
  }
}
