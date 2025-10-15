import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { mailbox_id, cleanerName, date, beforeCleanImage, afterCleanImage } =
    body;

  // 1. อัปโหลดรูปภาพ (สมมติว่า body ส่ง base64 มา)
  const uploadImage = async (base64: string, name: string) => {
    const buffer = Buffer.from(base64.split(",")[1], "base64");
    const { data, error } = await supabase.storage
      .from("mailbox-images")
      .upload(name, buffer, { contentType: "image/png", upsert: true });
    if (error) throw error;
    // คืนค่า Public URL ของรูปภาพ
    return supabase.storage.from("mailbox-images").getPublicUrl(data.path).data
      .publicUrl;
  };

  try {
    const beforeUrl = await uploadImage(
      beforeCleanImage,
      `before_${mailbox_id}_${Date.now()}.png`
    );
    const afterUrl = await uploadImage(
      afterCleanImage,
      `after_${mailbox_id}_${Date.now()}.png`
    );

    // 2. บันทึกข้อมูลลงตาราง cleaning_history
    const { data, error } = await supabase
      .from("cleaning_history")
      .insert([
        {
          mailbox_id,
          cleanerName,
          date,
          beforeCleanImage: beforeUrl,
          afterCleanImage: afterUrl,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
