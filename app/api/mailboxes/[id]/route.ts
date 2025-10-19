import { supabase } from "@/lib/supabaseClient";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log("--- DEBUGGING PUT Request ---");
    console.log("ID from URL (string):", id);

    // 1. รับ body ที่ส่งมา
    const body = await request.json();
    console.log("Raw body received:", body);

    // 2. แยกฟิลด์ที่ไม่ต้องการอัปเดตออก (เช่น id, created_at)
    const {
      id: bodyId,
      created_at,
      cleaningHistory,
      cleaning_history, // เผื่อมี snake_case ติดมา
      ...updateData
    } = body;

    // 3. --- 💡 จุดแก้ไขใหม่ ---
    //    แปลง lat/lng ให้เป็นตัวเลข (float) ก่อนเสมอ
    //    เพราะค่าจาก form อาจเป็น string
    if (updateData.lat !== undefined) {
      updateData.lat = parseFloat(updateData.lat);
    }
    if (updateData.lng !== undefined) {
      updateData.lng = parseFloat(updateData.lng);
    }

    console.log("Cleaned data to update:", updateData);

    // 4. --- 💡 จุดแก้ไขเดิม ---
    //    แปลง id จาก URL (string) ให้เป็น Number
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID provided in URL.");
    }
    console.log("Querying Supabase with numeric ID:", numericId);

    // 5. สั่งอัปเดต Supabase
    const { data, error } = await supabase
      .from("mailboxes")
      .update(updateData) // updateData ตอนนี้มี lat/lng เป็น number แล้ว
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

    // Log error สุดท้ายก่อนส่ง 500
    console.error("Returning 500 Error:", errorMessage, error);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
