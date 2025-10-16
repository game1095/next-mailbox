import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
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
    // <-- ไม่ต้องใส่ : any (error จะเป็น type unknown โดยปริยาย)
    let errorMessage = "An unexpected error occurred during the update.";

    // ตรวจสอบก่อนว่า error เป็น Error Object หรือไม่
    if (error instanceof Error) {
      errorMessage = error.message; // <-- ปลอดภัยแล้ว TypeScript รู้ว่ามี .message แน่นอน
    }

    console.error("Update Error:", error); // แสดง error ตัวเต็มใน console เพื่อ debug

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
