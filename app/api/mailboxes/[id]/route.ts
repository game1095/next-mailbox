import { supabase } from "@/lib/supabaseClient";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  // 1. เปลี่ยน Type ของ context ให้ตรงกับ Error log เป๊ะๆ
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 2. ใช้ await เพื่อรอให้ Promise ทำงานเสร็จก่อน แล้วค่อยดึง id ออกมา
    const { id } = await context.params;

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
