import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { BulkDeleteLessons } from "@/components/BulkDeleteLessons";

export default async function AdminSchedulePage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, group:groups(name, course:courses(level), teacher:profiles(full_name, email)), material:materials(title)")
    .gte("scheduled_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
    .order("scheduled_at")
    .limit(100);

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl font-bold text-palace-dark">{tr.schedule}</h1>
      <BulkDeleteLessons lessons={(lessons as any[]) ?? []} />
    </div>
  );
}
