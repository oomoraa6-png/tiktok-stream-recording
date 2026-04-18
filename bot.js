import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function updateStatus(id, status) {
  const { error } = await supabase
    .from('recording_requests')
    .update({ status: status })
    .eq('id', id);
  if (error) console.error("خطأ في التحديث:", error.message);
}

async function handleRecording(req) {
  console.log(`بدء تسجيل: ${req.username}`);
  await updateStatus(req.id, 'recording');
  
  try {
    // ضع كود التسجيل الخاص بك هنا
    await new Promise(r => setTimeout(r, 3000)); 
    
    await updateStatus(req.id, 'completed');
    console.log(`اكتمل: ${req.username}`);
  } catch (err) {
    console.error(`فشل: ${req.username}`, err.message);
    await updateStatus(req.id, 'failed');
  }
}

async function processPending() {
  const { data, error } = await supabase
    .from('recording_requests')
    .select('*')
    .eq('status', 'pending');
    
  if (error) return console.error("خطأ في القراءة:", error.message);
  if (data && data.length > 0) {
    console.log(`وجدت ${data.length} طلب معلق`);
    for (const req of data) await handleRecording(req);
  }
}

setInterval(processPending, 5000);
console.log("البوت يعمل...");
