# InvestMart — investment platform (EN / AR)

Home, subscription plans, referrals (25% of invitee deposits), USDT deposits (BEP20 + TRC20), and profile (withdraw + daily profit).

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

- Owner admin is created via `npx prisma db seed` (see `prisma/seed.ts`).
- `/admin` — set deposit & withdraw wallets, referral %, add/edit plans

## Test flow

1. Register a user (optional referral code).
2. Deposit — send USDT to the shown wallet, submit network, amount, and your sender address. Admin approves in `/admin` (+ 25% referral bonus to referrer).
3. Buy a $9 plan on **Plans**.
4. **Profile** → claim daily profit ($3 per active plan per day).
5. Request withdrawal to your wallet address.

---

Built with [BrainDaemon](https://braindaemon.com)
