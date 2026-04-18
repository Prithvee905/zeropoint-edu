import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/chat-sessions/[id] — get session + messages
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("session_id", id)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("GET messages error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ messages: messages ?? [] });
}

// DELETE /api/chat-sessions/[id] — delete a session
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

// PATCH /api/chat-sessions/[id] — update session title + updated_at
export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { title } = await req.json();

    const { error } = await supabase
        .from("chat_sessions")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        console.error("PATCH session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
