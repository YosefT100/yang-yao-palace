import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminPaymentsPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, student:profiles(full_name, email), group:groups(name, course:courses(level))")
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("*, enrollment:enrollments(student:profiles(full_name, email), group:groups(name, course:courses(level)))")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.payments}</h1>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Enrollments</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2">Student</th>
              <th className="py-2">Group</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {(enrollments as Record<string, unknown>[] | null)?.map((e) => (
              <tr key={e.id} className="border-b border-black/5">
                <td className="py-2 font-medium">{e.student?.full_name || e.student?.email}</td>
                <td className="py-2">{e.group?.course?.level} · {e.group?.name}</td>
                <td className="py-2">{formatPrice(e.price_amount, e.price_currency)}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    e.status === "active" ? "bg-green-100 text-green-700" :
                    e.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-black/5 text-palace-dark/50"
                  }`}>{e.status}</span>
                </td>
                <td className="py-2 text-palace-dark/50">{formatDateTime(e.created_at)}</td>
              </tr>
            ))}
            {!enrollments?.length && (
              <tr><td colSpan={5} className="py-4 text-center text-palace-dark/50">No enrollments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Payment history</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2">Student</th>
              <th className="py-2">Group</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {(payments as Record<string, unknown>[] | null)?.map((p) => (
              <tr key={p.id} className="border-b border-black/5">
                <td className="py-2 font-medium">{p.enrollment?.student?.full_name || p.enrollment?.student?.email}</td>
                <td className="py-2">{p.enrollment?.group?.course?.level} · {p.enrollment?.group?.name}</td>
                <td className="py-2">{formatPrice(p.amount, p.currency)}</td>
                <td className="py-2 capitalize">{p.status}</td>
                <td className="py-2 text-palace-dark/50">{formatDateTime(p.created_at)}</td>
              </tr>
            ))}
            {!payments?.length && (
              <tr><td colSpan={5} className="py-4 text-center text-palace-dark/50">No payments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
