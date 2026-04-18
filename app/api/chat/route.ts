import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, topicId } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        let contextText = "";
        let weakConceptsText = "";

        // RAG & Weak Point Logic
        if (topicId) {
            // 1. Fetch Syllabus Context
            const { data: topic, error: topicError } = await supabase
                .from("topics")
                .select("title, roadmaps(subject, goal, syllabus_text)")
                .eq("id", topicId)
                .single();

            if (!topicError && topic) {
                const roadmap = topic.roadmaps as any;
                contextText = `You are tutoring the student on the topic: "${topic.title}" from the subject "${roadmap?.subject}". Their goal is: "${roadmap?.goal}".`;

                if (roadmap?.syllabus_text) {
                    contextText += `\n\n=== SOURCE SYLLABUS DOCUMENT ===\n${roadmap.syllabus_text.substring(0, 15000)}...\n=================================\nBase your answers strictly on this content if it is relevant to their question.\n`;
                }
            }

            // 2. Fetch Weak Points from Quiz Attempts
            const { data: attempts, error: attemptsError } = await supabase
                .from("quiz_attempts")
                .select("weak_concepts")
                .eq("topic_id", topicId);

            if (!attemptsError && attempts && attempts.length > 0) {
                const allWeaknesses = attempts
                    .map(a => a.weak_concepts)
                    .flat()
                    .filter(Boolean);
                
                if (allWeaknesses.length > 0) {
                    weakConceptsText = `\n\n⚠️ IMPORTANT STUDENT CONTEXT ⚠️\nThe student previously failed quiz questions related to these concepts:\n- ${allWeaknesses.join("\n- ")}\nKeep this in mind and proactively explain these areas well if they come up!`;
                }
            }
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const systemPrompt = `You are ZEROPOINT — the world's most intuitive AI study tutor. 
Your goal is to make complex concepts feel like "common sense." 

${contextText}${weakConceptsText}

## 🧠 YOUR TEACHING STYLE:
- **Visual First:** Use emojis to label sections (e.g., 🚀 Analogy, 🛠️ How it Works).
- **Extreme Clarity:** Never use a big word when a small one will do.
- **Interactive Loops:** At the end of every explanation, ask a small "Check for Understanding" question or offer a "Challenge."
- **Code/Diagrams:** Use markdown code blocks to draw simple flowcharts or show logic.
- **Tone:** Encouraging, high-energy, and modern. Like a mentor, not a professor.

## 📦 RESPONSE STRUCTURE:
Wrap key sections in clear headers. Use this visual rhythm:

### [Concept Name] ✦
> **In one sentence:** (The simplest possible definition)

🚀 **The "Aha!" Analogy**
(A relatable real-world comparison)

🛠️ **Step-by-Step Logic**
1. ...
2. ...

💡 **Pro-Tip / Why it Matters**
(The "secret sauce" about this topic)

⚠️ **Common Pitfall**
(Don't let them make the usual mistake!)

---
**Quick Test:** (Ask one simple multi-choice or conceptual question to see if they got it)`;

        const systemMessage = {
            role: "system" as const,
            content: systemPrompt
        };

        const completion = await groq.chat.completions.create({
            messages: [systemMessage, ...messages],
            model: "llama-3.3-70b-versatile",
            max_tokens: 2048,
            temperature: 0.7,
        });

        const reply = completion.choices?.[0]?.message?.content || "No response from AI";

        return NextResponse.json({ reply });


    } catch (error: any) {
        console.error("AI ERROR:", error);

        return NextResponse.json(
            { error: "AI failed", details: error.message },
            { status: 500 }
        );
    }
}