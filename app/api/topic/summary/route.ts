import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { topicId } = await req.json();

        if (!topicId) {
            return NextResponse.json({ error: "No topic ID provided" }, { status: 400 });
        }

        // 1. Fetch Topic from DB
        const { data: topic, error: topicError } = await supabase
            .from("topics")
            .select("*, roadmaps(goal, subject)")
            .eq("id", topicId)
            .single();

        if (topicError || !topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        // 2. Return cached summary if it exists
        if (topic.ai_summary) {
            return NextResponse.json({ summary: topic.ai_summary, title: topic.title });
        }

        // 3. Generate summary dynamically using Groq
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const roadmapContext = `Subject: ${(topic.roadmaps as any)?.subject}, Student Goal: ${(topic.roadmaps as any)?.goal}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an elite AI tutor. 
Explain the provided topic in relation to the overall subject and student goal.
Format your response in Markdown using these specific headers:
### 📖 Definition
(2 simple lines)
### 💡 Example
(An easy concrete example)
### 🔑 Key Concepts
(3-4 short bullet points)

Keep it very structured and easy to read. Avoid large dense paragraphs.`
                },
                {
                    role: "user",
                    content: `Topic to explain: ${topic.title}\nContext: ${roadmapContext}`
                }
            ]
        });

        const newSummary = completion.choices?.[0]?.message?.content || "Explanation generation failed.";

        // 4. Save back to DB
        await supabase
            .from("topics")
            .update({ ai_summary: newSummary, status: 'in_progress' })
            .eq("id", topicId);

        return NextResponse.json({ summary: newSummary, title: topic.title });

    } catch (error: any) {
        console.error("Topic Summary Error:", error);
        return NextResponse.json(
            { error: "Failed to load topic details", details: error.message },
            { status: 500 }
        );
    }
}
