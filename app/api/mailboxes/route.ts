import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabase
    .from("mailboxes")
    .select("*, cleaning_history(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
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
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
