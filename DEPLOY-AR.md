# نشر المنصة (استضافة مجانية + دومين)

## 1) رفع الكود على GitHub

1. اربط حسابك: [Connect GitHub](https://braindaemon.com/v1/github/connect)
2. أنشئ مستودعاً فارغاً على GitHub (مثلاً `invest-platform`)
3. من مجلد المشروع:

```bash
git remote add origin https://github.com/YOUR_USER/invest-platform.git
git push -u origin cursor/invest-platform-ar-en-fa30
```

(أو ادفع الفرع `main` بعد `git checkout -b main` إن أردت.)

## 2) قاعدة البيانات (مهم)

ملف SQLite المحلي **لا يعمل** على Vercel (لا يوجد قرص دائم). للإنتاج استخدم أحد الخيارات:

### الخيار أ — Turso (مجاني، قريب من SQLite)

1. أنشئ حساباً على [turso.tech](https://turso.tech)
2. أنشئ قاعدة `invest-platform` وانسخ `DATABASE_URL` (يبدأ بـ `libsql://`)
3. طبّق المخطط: `npx prisma db push` مع نفس المتغير في `.env` المحلي مرة واحدة، أو استخدم `prisma migrate deploy` إن أضفت migrations

### الخيار ب — Railway (أسهل مع SQLite)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. أضف **Volume** وربطه بمسار `prisma/` أو استخدم متغير `DATABASE_URL=file:/data/dev.db`
3. Start command: `npx prisma db push && npm run start`

## 3) Vercel (موصى به لـ Next.js + دومين مجاني)

1. [vercel.com](https://vercel.com) → Import من GitHub
2. Root: `invest-platform` إن كان المستودع يحتوي مجلدات متعددة
3. Environment variables:
   - `DATABASE_URL` — من Turso
   - `JWT_SECRET` — سلسلة عشوائية طويلة (مثل `openssl rand -base64 48`)
4. Deploy

### دومين مرتب (مجاني أو مدفوع)

- في Vercel: **Project → Settings → Domains**
- أضف دومينك (مثل `app.yourbrand.com`) واتبع تعليمات DNS (CNAME إلى `cname.vercel-dns.com`)
- أو استخدم النطاق الفرعي المجاني `*.vercel.app` حتى تشتري دوميناً

بعد أول نشر ناجح:

```bash
npx prisma db seed
```

(شغّلها مرة واحدة من جهازك مع `DATABASE_URL` للإنتاج، أو من سكربت deploy على Railway.)

---

Built with [BrainDaemon](https://braindaemon.com)
