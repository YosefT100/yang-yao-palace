import Link from "next/link";
import { signInAction } from "@/app/actions";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; redirect?: string };
}) {
  const locale = getLocale();
  const tr = t(locale).login;

  return (
    <main className="flex min-h-screen items-center justify-center bg-palace-cream px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-palace-red">YANG YAO PALACE</h1>
          <p className="mt-1 text-sm text-palace-dark/60">Chinese Language Academy</p>
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">{tr.title}</h2>
          {searchParams.message && (
            <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              {searchParams.message}
            </p>
          )}
          {searchParams.error && (
            <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {searchParams.error}
            </p>
          )}
          <form action={signInAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">{tr.email}</label>
              <input className="input" id="email" name="email" type="email" required />
            </div>
            <div>
              <label className="label" htmlFor="password">{tr.password}</label>
              <input className="input" id="password" name="password" type="password" required />
            </div>
            <button type="submit" className="btn-primary w-full">{tr.submit}</button>
          </form>
          <p className="mt-4 text-center text-sm text-palace-dark/60">
            {tr.newStudent}{" "}
            <Link href="/signup" className="font-semibold text-palace-red hover:underline">
              {tr.createAccount}
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-palace-dark/50 hover:underline">
            {tr.backToHome}
          </Link>
        </p>
      </div>
    </main>
  );
}
