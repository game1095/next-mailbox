import { supabase } from "@/lib/supabaseClient";
// Import NextRequest เข้ามาด้วย
import { NextResponse, NextRequest } from "next/server";

// export const runtime = "nodejs"; // <-- ลบบรรทัดนี้ออก

export async function PUT(
  request: NextRequest, // <-- ใช้ NextRequest เหมือนเดิม
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
