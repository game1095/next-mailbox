import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mailbox_id, cleanerName, date, beforeCleanImage, afterCleanImage } =
      body;

    // A simple function to upload base64 images to Supabase Storage
    const uploadImage = async (base64: string, name: string) => {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64.split(",")[1], "base64");

      const { data, error } = await supabase.storage
        .from("mailbox-images")
        .upload(name, buffer, { contentType: "image/png", upsert: true });

      if (error) throw error;

      // Return the public URL of the uploaded image
      return supabase.storage.from("mailbox-images").getPublicUrl(data.path)
        .data.publicUrl;
    };

    const beforeUrl = await uploadImage(
      beforeCleanImage,
      `before_${mailbox_id}_${Date.now()}.png`
    );
    const afterUrl = await uploadImage(
      afterCleanImage,
      `after_${mailbox_id}_${Date.now()}.png`
    );

    // Insert the new cleaning record into the database
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
    // ✨ แก้ไข: ระบุ Type ของ error เป็น any
    console.error("Cleaning API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
