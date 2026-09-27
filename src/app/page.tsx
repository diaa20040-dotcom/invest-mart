import Image from "next/image";
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
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t(locale, "shopsTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {locale === "ar"
            ? "محلات شريكة مع المنصة"
            : "Stores partnered with the platform"}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {shops.map((shop) => (
            <article
              key={shop.img}
              className="group card overflow-hidden transition hover:shadow-md"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={shop.img}
                  alt={locale === "ar" ? shop.titleAr : shop.titleEn}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="border-t border-slate-100 px-4 py-3.5">
                <h3 className="font-medium text-slate-800">
                  {locale === "ar" ? shop.titleAr : shop.titleEn}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">{t(locale, "demoNote")}</p>
    </div>
  );
}
