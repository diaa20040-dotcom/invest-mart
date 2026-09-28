# نشر المنصة — استضافة مجانية + دومين مرتب

الكود على GitHub في المستودع **`invest-mart`**. اتبع الخطوات بالترتيب (حوالي 20–30 دقيقة).

---

## الخطوة 1 — قاعدة بيانات Turso (مجاني)

SQLite المحلي **لا يعمل** على Vercel. Turso مجاني ومناسب لـ Prisma.

1. سجّل في [turso.tech](https://turso.tech) (حساب GitHub).
2. من لوحة Turso: **Create database** → اسم مثل `invest-mart`.
3. من تفاصيل القاعدة انسخ:
   - **Database URL** (يبدأ بـ `libsql://`)
   - **Auth Token** (من Create Token أو Database → Tokens)
4. على جهازك (أو من BrainDaemon بعد تعبئة `.env`):

```bash
cd invest-platform
cp .env.example .env
```

ضع في `.env`:

```env
DATABASE_URL="libsql://...."
TURSO_AUTH_TOKEN="eyJ..."
JWT_SECRET="ضع-سلسلة-عشوائية-طويلة"
```

توليد `JWT_SECRET` (اختياري):

```bash
openssl rand -base64 48
```

5. طبّق الجداول والبيانات الأولية **مرة واحدة** (مع رابط `libsql://` لا يعمل `prisma db push` من CLI):

```bash
npm install
npm run db:production:setup
```

(أو: `npm run db:turso:schema` ثم `npm run db:seed`)

> بعد النشر، غيّر كلمة مرور الأدمن من لوحة `/admin` أو من الإعدادات.

---

## الخطوة 2 — Vercel (استضافة Next.js مجانية)

1. [vercel.com](https://vercel.com) → **Sign up** بحساب GitHub.
2. **Add New… → Project** → اختر مستودع **`invest-mart`**.
3. **Root Directory**: اتركه `.` (جذر المستودع).
4. **Environment Variables** (لـ Production و Preview):

| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | نفس رابط `libsql://` من Turso |
| `TURSO_AUTH_TOKEN` | توكن Turso |
| `JWT_SECRET` | نفس السر الطويل من `.env` |

5. **Deploy** وانتظر حتى يصبح Build أخضر.

الرابط المجاني يكون مثل: **`invest-mart.vercel.app`** (يمكن تغيير اسم المشروع من Settings → General → Project Name).

---

## الخطوة 3 — دومين مرتب (اختياري)

### أ) مجاني — نطاق Vercel

- من Vercel: **Project → Settings → Domains**
- النطاق `اسم-مشروعك.vercel.app` يعمل فوراً بعد أول نشر ناجح.

### ب) دومين خاص (احترافي)

1. اشترِ دوميناً من مسجّل (مثل Cloudflare Registrar أو Namecheap)، مثلاً: `investmart.com` أو `yourbrand.com`.
2. في Vercel: **Settings → Domains → Add** → أدخل `www.yourdomain.com` و/أو `yourdomain.com`.
3. في لوحة DNS للمسجّل (كما يظهر في Vercel):

| النوع | الاسم | القيمة |
|-------|--------|--------|
| **CNAME** | `www` | `cname.vercel-dns.com` |
| **A** | `@` | `76.76.21.21` |

4. انتظر حتى يظهر **Valid** وشهادة SSL (دقائق إلى ساعات).

> نصيحة: اجعل `www` هو الرابط الرئيسي، وفعّل في Vercel توجيه الجذر `@` إلى `www` إن رغبت.

---

## الخطوة 4 — بعد النشر

- افتح الموقع → سجّل مستخدماً أو استخدم حساب الأدمن من الـ seed.
- لوحة الإدارة: **`/admin`** (للمستخدمين الذين `isAdmin = true`).
- أي تحديث على `main` في GitHub يعيد النشر تلقائياً على Vercel.

---

## بديل: Railway (SQLite على قرص)

إذا فضّلت عدم استخدام Turso:

1. [railway.app](https://railway.app) → مشروع من GitHub.
2. أضف **Volume** وربطه بمسار البيانات.
3. `DATABASE_URL=file:/data/prod.db` وشغّل `prisma db push` في أمر البدء.

التفاصيل أقل أتمتة من Vercel+Turso؛ للمنصة الحالية **Vercel + Turso** هو المسار الموصى به.

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| خطأ DB عند تسجيل الدخول | تأكد من `TURSO_AUTH_TOKEN` + `DATABASE_URL` على Vercel ومن تشغيل `db push` و `db:seed` مرة |
| Build فاشل | راجع Logs على Vercel؛ محلياً: `npm run build` |
| الجلسة لا تثبت | `JWT_SECRET` ثابت في Production ولا يتغير بين النشرات |

---

Built with [BrainDaemon](https://braindaemon.com)
