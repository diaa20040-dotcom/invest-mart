import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t, type Locale } from "@/lib/i18n";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { HomeOverview } from "@/components/HomeOverview";

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
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userPlans = await prisma.userPlan.findMany({
      where: { userId: user.id },
      include: { plan: true },
    });
    const activePlansCount = userPlans.filter((up) => up.plan.active).length;
    const dailyProfitUsd = userPlans
      .filter((up) => up.plan.active)
      .reduce((sum, up) => sum + up.plan.dailyProfitUsd, 0);

    const referralAgg = await prisma.transaction.aggregate({
      where: { userId: user.id, type: "referral" },
      _sum: { amount: true },
    });
    const invitedCount = await prisma.user.count({
      where: { referredById: user.id },
    });
    const recentTx = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

  const overview = (
    <HomeOverview
      locale={locale as Locale}
      showAdmin={canAccessAdmin(user)}
      user={{
        name: user.name,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
      }}
      activePlansCount={activePlansCount}
      dailyProfitUsd={dailyProfitUsd}
      referralEarnings={referralAgg._sum.amount ?? 0}
      invitedCount={invitedCount}
      recentTx={recentTx}
    />
  );

  return (
    <div className="space-y-8">
      {overview}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t(locale, "shopsTitle")}
            </h2>
            <p className="text-sm text-slate-500">{t(locale, "homeShopsHint")}</p>
          </div>
          <Link
            href="/plans"
            className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {t(locale, "heroCta")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {shops.map((shop) => (
            <article
              key={shop.img}
              className="group card overflow-hidden transition hover:shadow-md"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={shop.img}
                  alt={locale === "ar" ? shop.titleAr : shop.titleEn}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="border-t border-slate-100 px-4 py-3">
                <h3 className="font-medium text-slate-800">
                  {locale === "ar" ? shop.titleAr : shop.titleEn}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
