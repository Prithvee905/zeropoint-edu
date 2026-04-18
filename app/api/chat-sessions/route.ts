import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/chat-sessions — list sessions, optionally filtered by topicId
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    let query = supabase
        .from("chat_sessions")
        .select("id, title, created_at, updated_at, topic_id")
        .order("updated_at", { ascending: false })
        .limit(100);

    if (topicId) {
        query = query.eq("topic_id", topicId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("GET sessions error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ sessions: data ?? [] });
}

// POST /api/chat-sessions — create a new session
export async function POST(req: Request) {
    const { title, roadmapId, topicId } = await req.json();

    const { data, error } = await supabase
        .from("chat_sessions")
        .insert([{
            title: title || "New Chat",
            roadmap_id: roadmapId || null,
            topic_id: topicId || null,
        }])
        .select()
        .single();

    if (error) {
        console.error("POST session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ session: data });
}
