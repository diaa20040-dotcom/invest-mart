import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

const shops = [
  {
    titleEn: "Corner Grocery",
    titleAr: "بقالة الحارة",
    img: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
  },
  {
    titleEn: "Fashion Boutique",
    titleAr: "بوتيك أزياء",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  },
  {
    titleEn: "Electronics Hub",
    titleAr: "معرض إلكترونيات",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  },
  {
    titleEn: "Café & Bakery",
    titleAr: "مقهى ومخبز",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
  },
];

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-900 px-6 py-10 text-white shadow-lg">
        <h1 className="max-w-xl text-3xl font-bold leading-tight md:text-4xl">
          {t(locale, "heroTitle")}
        </h1>
        <p className="mt-3 max-w-lg text-emerald-50/90">{t(locale, "heroSubtitle")}</p>
        <Link
          href="/plans"
          className="mt-6 inline-block rounded-xl bg-white px-5 py-2.5 font-semibold text-emerald-800 shadow"
        >
          {t(locale, "heroCta")}
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {t(locale, "shopsTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {shops.map((shop) => (
            <article
              key={shop.img}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={shop.img}
                  alt={locale === "ar" ? shop.titleAr : shop.titleEn}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-800">
                  {locale === "ar" ? shop.titleAr : shop.titleEn}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {t(locale, "demoNote")}
      </p>
    </div>
  );
}
