# ابدأ من هنا — نشر المنصة على Vercel (خطوة بخطوة)

اتبع بالترتيب. كل خطوة في سطر واحد.

---

## 1) افتح المشروع على Vercel

1. من الجوال أو الكمبيوتر افتح **vercel.com** وسجّل الدخول.
2. من القائمة اختر مشروع **`invest-mart`** (أو الاسم الذي ظهر عند الربط).

---

## 2) تأكد أن الكود من GitHub

1. من أسفل الصفحة أو القائمة: **Settings** (إعدادات).
2. **Git** → يجب أن يظهر مستودع **`invest-mart`** وفرع **`main`**.
3. إن لم يكن مربوطاً: **Connect Git Repository** واختر **`invest-mart`**.

---

## 3) متغيرات البيئة (مرة واحدة)

1. **Settings** → **Environment Variables**.
2. أضف الثلاثة (لـ **Production** و **Preview**):

| الاسم | ماذا تضع |
|--------|-----------|
| `DATABASE_URL` | رابط Turso يبدأ بـ `libsql://` |
| `TURSO_AUTH_TOKEN` | توكن Turso |
| `JWT_SECRET` | نفس السر الطويل الذي استخدمته عند تهيئة القاعدة |

3. احفظ.

---

## 4) نشر جديد (مهم)

**لا تضغط Redeploy على نشر أحمر قديم.**

1. اذهب إلى **Deployments** (النشرات).
2. اضغط **Create Deployment** (أو انتظر نشراً تلقائياً بعد أي تحديث على GitHub).
3. اختر فرع **`main`** → **Deploy**.
4. إن وُجد: فعّل **Clear build cache** مرة واحدة.

---

## 5) هل نجح البناء؟

1. افتح النشر → **Build Logs**.
2. ابحث عن: **`Next.js 15.1.12`**
   - إن ظهر **15.1.0** → أنت على نشر قديم؛ ارجع للخطوة 4 واختر **`main`** من جديد.
3. إن الحالة **Ready** (أخضر): اضغط **Visit** أو افتح **`invest-mart.vercel.app`**.

---

## 6) تهيئة قاعدة Turso (مرة واحدة — مهم)

بدون هذه الخطوة **التسجيل وتسجيل الدخول لن يعملا**.

### أ) متغيرات Vercel

تأكد من وجود:

- `DATABASE_URL` = `libsql://...`
- `TURSO_AUTH_TOKEN`
- `JWT_SECRET`
- `SETUP_SECRET` = أي سلسلة سرية طويلة تختارها أنت (مثال: `MySetupSecret2026`)

ثم **Redeploy**.

### ب) تشغيل التهيئة (من الجوال أو الكمبيوتر)

استخدم تطبيق **Postman** أو موقع **hoppscotch.io** أو من الكمبيوتر:

- **POST** إلى: `https://invest-mart.vercel.app/api/setup/bootstrap`
- **Body** (JSON):

```json
{ "secret": "نفس قيمة SETUP_SECRET" }
```

إذا نجحت: `{ "ok": true }`

### ج) التحقق

افتح في المتصفح: `https://invest-mart.vercel.app/api/health/db`  
يجب أن ترى: `{ "ok": true }`

---

## 7) بعد فتح الموقع

1. سجّل دخول **الأدمن** (البريد المحدد في الـ seed — وليس بريد تجريبي آخر).
2. لوحة الإدارة: **`/admin`**.

---

## إن ظهر Error

1. من **Build Logs** انزل للأسفل.
2. انسخ آخر **10 أسطر حمراء** وأرسلها في محادثة BrainDaemon.

---

Built with [BrainDaemon](https://braindaemon.com)
