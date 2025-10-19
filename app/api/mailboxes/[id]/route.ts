import { supabase } from "@/lib/supabaseClient";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  // 1. 💡 REVERT: เปลี่ยน Type กลับไปเป็น Promise ตามที่ Vercel ต้องการ
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 2. 💡 REVERT: ใช้ await context.params เพื่อดึง id ออกมาเหมือนเดิม
    const { id: idFromPromise } = await context.params;

    console.log("--- DEBUGGING PUT Request ---");
    console.log("ID from URL (string):", idFromPromise);

    const body = await request.json();
    console.log("Raw body received:", body);

    // 3. แยกฟิลด์ที่ไม่ต้องการอัปเดตออก
    const {
      id: bodyId,
      created_at,
      cleaningHistory,
      cleaning_history, // เผื่อมี snake_case ติดมา
      ...updateData
    } = body;

    // 4. 💡 KEEP: ยังคงแปลง lat/lng เป็น number
    //    (ใช้ parseFloat เพราะ lat/lng เป็นทศนิยม)
    if (updateData.lat !== undefined) {
      updateData.lat = parseFloat(updateData.lat as string);
    }
    if (updateData.lng !== undefined) {
      updateData.lng = parseFloat(updateData.lng as string);
    }

    console.log("Cleaned data to update:", updateData);

    // 5. 💡 KEEP: ยังคงแปลง id ที่ได้มา (string) ให้เป็น number
    //    (ใช้ Number เพราะ id เป็นจำนวนเต็ม)
    const numericId = Number(idFromPromise);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID provided in URL.");
    }
    console.log("Querying Supabase with numeric ID:", numericId);

    // 6. สั่งอัปเดต Supabase
    const { data, error } = await supabase
      .from("mailboxes")
      .update(updateData)
      .eq("id", numericId) // ใช้ numericId ที่แปลงแล้ว
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      throw error; // โยน error ให้ catch บล็อกข้างนอกจัดการ
    }

    console.log("Update Success:", data);
    return NextResponse.json(data);
  } catch (error) {
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Returning 500 Error:", errorMessage, error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
