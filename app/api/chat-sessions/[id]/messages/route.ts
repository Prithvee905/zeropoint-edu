import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/chat-sessions/[id]/messages — save a message
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { role, content } = await req.json();

    const { data, error } = await supabase
        .from("chat_messages")
        .insert([{ session_id: id, role, content }])
        .select()
        .single();

    if (error) {
        console.error("POST message error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: data });
}
