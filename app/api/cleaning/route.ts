import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Important for Vercel deployment

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mailbox_id, cleanerName, date, beforeCleanImage, afterCleanImage } =
      body;

    const uploadImage = async (base64: string, name: string) => {
      if (!base64 || !base64.startsWith("data:image")) {
        // Handle placeholder case
        return null;
      }
      const buffer = Buffer.from(base64.split(",")[1], "base64");

      const { data, error } = await supabase.storage
        .from("mailbox-images")
        .upload(name, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (error) {
        console.error("Supabase Storage Error:", error);
        throw error;
      }
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

    if (error) {
      console.error("Supabase DB Insert Error:", error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    // ✨ แก้ไข: ระบุ Type ของ error เป็น any เพื่อให้ Build ผ่าน
    console.error("Cleaning API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: 500 }
    );
  }
}
