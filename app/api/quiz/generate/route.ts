import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { topicId } = await req.json();

        if (!topicId) {
            return NextResponse.json({ error: "No topic ID provided" }, { status: 400 });
        }

        // Fetch topic explanation
        const { data: topic, error } = await supabase
            .from("topics")
            .select("title, ai_summary")
            .eq("id", topicId)
            .single();

        if (error || !topic || !topic.ai_summary) {
            return NextResponse.json({ error: "Topic or summary not found. Complete the AI lesson first." }, { status: 404 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an expert quiz generator. Your task is to generate exactly 3 highly relevant multiple-choice questions based ONLY on the provided lesson text.
                    
Return the response strictly as valid JSON matching this exact structure:
{
  "questions": [
    {
      "question": "What is the primary function of...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Option A is correct because..."
    }
  ]
}
Note: correctAnswer is the zero-based index of the correct string in the options array.`
                },
                {
                    role: "user",
                    content: `Topic: ${topic.title}\n\nLesson Content: \n${topic.ai_summary}`
                }
            ]
        });

        const quizData = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

        if (!quizData.questions) {
            throw new Error("Invalid format from AI");
        }

        return NextResponse.json({ questions: quizData.questions });

    } catch (error: any) {
        console.error("Quiz Gen Error:", error);
        return NextResponse.json(
            { error: "Failed to generate quiz", details: error.message },
            { status: 500 }
        );
    }
}
