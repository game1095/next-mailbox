import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ฟังก์ชันสำหรับ "แก้ไข" ข้อมูล (ฉบับสมบูรณ์)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // ✨ แก้ไข: สร้าง Object ใหม่ที่มีเฉพาะข้อมูลที่ต้องการอัปเดตจริงๆ ✨
    const updateData = {
      postOffice: body.postOffice,
      postalCode: body.postalCode,
      jurisdiction: body.jurisdiction,
      landmark: body.landmark,
      lat: body.lat,
      lng: body.lng,
    };

    const { data, error } = await supabase
      .from("mailboxes")
      .update(updateData) // ส่งข้อมูลที่กรองแล้วไปอัปเดต
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error);
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PUT API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
