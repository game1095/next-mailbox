import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mailboxes")
      .select("*, cleaning_history(*)")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    // <-- ไม่ต้องระบุ type, TypeScript จะมองเป็น 'unknown'
    let errorMessage = "Failed to fetch data due to an unknown error.";

    // ตรวจสอบก่อนว่า error เป็น instance ของ Error หรือไม่
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // นอกจากนี้ error จาก Supabase อาจเป็น object ที่มี message โดยตรง
    else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String((error as { message: unknown }).message);
    }

    console.error("GET Error:", error); // Log error ตัวเต็มไว้สำหรับ debug

    // ส่ง errorMessage ที่ปลอดภัยกลับไป
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("mailboxes")
      .insert([body])
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    // <-- เอา : any ออก, TypeScript จะถือว่าเป็น type 'unknown'

    let errorMessage = "An unknown error occurred during the request.";

    // ตรวจสอบให้แน่ใจว่า error เป็น instance ของ Error object
    if (error instanceof Error) {
      errorMessage = error.message; // <-- บรรทัดนี้ปลอดภัย 100%
    }

    console.error("POST Error:", error); // Log error ตัวเต็มไว้สำหรับตรวจสอบ

    // ส่ง errorMessage ที่ผ่านการตรวจสอบแล้วกลับไป
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
