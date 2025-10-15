import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  // ดึงข้อมูล mailboxes พร้อมกับ cleaningHistory ที่เกี่ยวข้อง
  const { data, error } = await supabase
    .from("mailboxes")
    .select("*, cleaning_history(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("mailboxes")
    .insert([body])
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
