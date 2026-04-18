import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";
import { createRequire } from "module";

const requireNode = createRequire(import.meta.url);

export const maxDuration = 60; // Allow 60s for PDF parsing + AI generation

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const subject = formData.get("subject") as string;
    const goal = formData.get("goal") as string;
    const examDate = formData.get("examDate") as string;
    const hours = formData.get("hours") as string;
    const file = formData.get("file") as File | null;

    if (!subject || !goal || !hours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let parsedSyllabusText = "";

    // Parse PDF if uploaded
    if (file && file.size > 0 && file.type === "application/pdf") {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Use pdf2json to bypass Next.js edge bundling issues
            const PDFParser = require("pdf2json");
            const pdfParser = new PDFParser(null, 1);
            
            parsedSyllabusText = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
                pdfParser.parseBuffer(buffer);
            });

            console.log("PDF Parsed successfully. Characters:", parsedSyllabusText.length);
        } catch (pdfError: any) {
            console.error("PDF Parsing Error:", pdfError);
            return NextResponse.json({ error: "Failed to read the PDF file. Ensure it is a valid text-based PDF.", details: pdfError?.message || pdfError?.toString() || "Unknown error" }, { status: 400 });
        }
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    const systemInstruction = parsedSyllabusText 
        ? `You are an expert curriculum designer. A student needs a daily roadmap to achieve their learning goal. 
           They have uploaded a syllabus document. You MUST base the curriculum strictly around the topics found in the provided syllabus text.
           Keep the overall roadmap to 5-7 days for this MVP.
           Output exactly Valid JSON matching this format:
           {
             "roadmap": [
               {
                 "day": 1,
                 "title": "Topic Title",
                 "tasks": ["Read introduction", "Practice 2 problems"]
               }
             ]
           }`
        : `You are an expert curriculum designer. A student needs a daily roadmap to achieve their learning goal. 
           Create a structured step-by-step plan. Ensure tasks fit the daily hours allocated.
           Keep the overall roadmap to 5-7 days for this MVP to make it manageable.
           Output exactly Valid JSON matching this format:
           {
             "roadmap": [
               {
                 "day": 1,
                 "title": "Topic Title",
                 "tasks": ["Read introduction", "Practice 2 problems"]
               }
             ]
           }`;

    let userPrompt = `Subject: ${subject}, Goal: ${goal}, Exam Date: ${examDate || 'N/A'}, Daily Hours: ${hours}`;
    if (parsedSyllabusText) {
        // Limit text to avoid blowing up Groq's token window (LLaMA 3 70B can handle ~8k generally, up to 128k depending on endpoint limits, keeping safe margin)
        userPrompt += `\n\n=== SYLLABUS DOCUMENT CONTENTS ===\n${parsedSyllabusText.substring(0, 15000)}...\n=====================\n\nPlease build the 5-7 day roadmap strictly mapping to the most important topics in this syllabus file.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      model: "llama-3.3-70b-versatile",
    });

    const roadmapData = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    if (!roadmapData.roadmap) {
       throw new Error("Invalid format from AI");
    }

    // Insert into Supabase
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert([
        {
          subject,
          goal,
          exam_date: examDate || null,
          daily_hours: parseFloat(hours),
          syllabus_text: parsedSyllabusText || null
        }
      ])
      .select()
      .single();

    if (roadmapError) throw roadmapError;

    // Insert Topics and Tasks
    for (const day of roadmapData.roadmap) {
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .insert([
          {
            roadmap_id: roadmap.id,
            title: day.title,
            day_number: day.day,
          }
        ])
        .select()
        .single();

      if (topicError) throw topicError;

      const tasksToInsert = day.tasks.map((desc: string) => ({
        topic_id: topic.id,
        task_type: desc.toLowerCase().includes('practice') || desc.toLowerCase().includes('problem') ? 'practice' : 'read',
        description: desc
      }));

      await supabase.from("tasks").insert(tasksToInsert);
    }

    return NextResponse.json({ success: true, roadmapId: roadmap.id, roadmap: roadmapData.roadmap });
  } catch (error: any) {
    console.error("Roadmap Gen Error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap", details: error.message },
      { status: 500 }
    );
  }
}
