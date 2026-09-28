import { getLocale } from "@/lib/locale";
import { LocaleSupportBar } from "@/components/LocaleSupportBar";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      lang={locale}
      className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.45),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />
      <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-6">
        <LocaleSupportBar variant="auth" />
      </div>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}
