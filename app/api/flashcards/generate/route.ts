import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { topicId } = await req.json();

        if (!topicId) return NextResponse.json({ error: "No topic ID" }, { status: 400 });

        const { data: topic, error } = await supabase
            .from("topics")
            .select("title, ai_summary")
            .eq("id", topicId)
            .single();

        if (error || !topic || !topic.ai_summary) {
            return NextResponse.json({ error: "Topic lesson not found. Complete the AI lesson first." }, { status: 404 });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are a spaced-repetition flashcard expert. Generate exactly 5 concise flashcards from the lesson content.
Return ONLY valid JSON:
{
  "flashcards": [
    { "front": "Short question or term", "back": "Concise answer or definition (max 2 sentences)" }
  ]
}
Make flashcards specific, testable, and focused on the most important concepts.`
                },
                {
                    role: "user",
                    content: `Topic: ${topic.title}\n\nLesson:\n${topic.ai_summary}`
                }
            ]
        });

        const data = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

        if (!data.flashcards) throw new Error("Invalid format from AI");

        return NextResponse.json({ flashcards: data.flashcards });

    } catch (error: any) {
        console.error("Flashcard Gen Error:", error);
        return NextResponse.json({ error: "Failed to generate flashcards", details: error.message }, { status: 500 });
    }
}
