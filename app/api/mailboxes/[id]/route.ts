import { supabase } from "@/lib/supabaseClient";
import { NextResponse, NextRequest } from "next/server";

// กำหนด Type ของ context ให้ชัดเจน
type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // ดึง id ออกมาจาก context.params
    const { id } = context.params;

    const body = await request.json();
    const { id: bodyId, created_at, cleaningHistory, ...updateData } = body;

    const { data, error } = await supabase
      .from("mailboxes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    let errorMessage = "An unexpected error occurred during the update.";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Update Error:", error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
