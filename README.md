# InvestMart — investment platform demo (EN / AR)

Five main sections: home (partner store gallery), subscription plans, referrals (10%), deposit wallet, and profile (withdraw + daily profit claim).

## Quick start

```bash
cd invest-platform
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000

## Admin

- Email: `admin@invest.local`
- Password: `admin123`
- `/admin` — set deposit & withdraw wallets, referral %, add/edit plans

## Test flow

1. Register a user (optional referral code).
2. Deposit — send amount; demo auto-approves in ~3 seconds and credits balance (+ referral bonus to referrer).
3. Buy a $9 plan on **Plans**.
4. **Profile** → claim daily profit ($3 per active plan per day).
5. Request withdrawal to your wallet address.

---

Built with [BrainDaemon](https://braindaemon.com)
