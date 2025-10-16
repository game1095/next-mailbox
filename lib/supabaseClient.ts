// ตัวอย่างไฟล์ lib/supabaseClient.ts

import { createClient } from "@supabase/supabase-js";

// ดึงค่ามาจาก Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// เครื่องหมาย ! ท้ายตัวแปรเป็นการบอก TypeScript ว่า "เรารับประกันว่าตัวแปรนี้จะมีค่าแน่นอน"
// เพราะเราได้ไปตั้งค่าไว้ใน Vercel แล้ว

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
