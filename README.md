# 🗓️ DeepCal - Modern Scheduling Infrastructure

**🚀 Live Demo:** [https://deep-cal.vercel.app/](https://deep-cal.vercel.app/)

DeepCal is a full-stack scheduling platform meticulously designed to replicate the sleek, user-centric interface and functionality of **Cal.com**. It empowers users to define availability, create custom event types, and seamlessly manage incoming bookings without the back-and-forth of traditional email scheduling.

---

## ✨ Core Features & UI Implementation

* **Cal.com UI/UX Architecture:** The interface patterns, typography, and clean dashboard layouts were heavily inspired by studying Cal.com's live design system. This includes minimalist event cards, real-time search filtering, and a professional, date-grouped horizontal bookings list.

* **Date Overrides & Custom Availability:** Beyond a standard weekly schedule, hosts can block out specific dates or set custom hours for specific days. The scheduling engine dynamically adapts to these overrides in real-time.

* **Conflict-Free Scheduling Engine:** A robust, dynamic algorithm calculates available time slots on the fly. It cross-references the host's base availability and date overrides with existing database bookings to guarantee zero double-bookings.

* **Dynamic Timezone Support:** Built-in timezone selection allows the host to set their specific local timezone for accurate slot generation.

* **The "Force Field" Buffer System:** Advanced padding logic that automatically enforces custom rest periods (e.g., 5, 15, or 30 minutes) before and after scheduled meetings to prevent burnout.

* **Dynamic Event Type Management:** Support for generating multiple meeting configurations with custom durations, unique URL slugs, and color identifiers.

* **Real-time Search & Filtering:** A lightning-fast search bar on the dashboard to instantly filter event types by title or URL slug.

* **Automated Email Confirmations (Resend API):** Integrated with Resend to deliver beautifully formatted HTML confirmation emails instantly upon booking. *(Note: Currently restricted to verified developer email in free tier).*

---

## 📌 Assumptions Made (As per Requirements)

* **Authentication Bypass:** No user login system (like NextAuth or Clerk) has been implemented. The system operates under the assumption that a `defaultuser` is continuously logged into the admin dashboard.

* **Public Access:** The public-facing booking page is accessible to anyone on the internet without requiring them to create a guest account.

* **Pre-seeded Environment:** The database contains sample event types and dummy bookings to demonstrate immediate functionality upon evaluation.

---

## 🗄️ Database Design (Prisma + PostgreSQL)

The database schema was custom-designed to handle relational scheduling logic efficiently. The core tables include:

1. **User:** Holds the primary account (`defaultuser`) and baseline settings.
2. **EventType:** Stores meeting metadata like Title, Duration, URL Slug, and Buffer Times.
3. **Availability:** Stores a 7-day schedule matrix for active meeting hours.
4. **DateOverride:** Stores specific dates with custom hours that supersede the weekly availability.
5. **Booking:** Stores guest details, meeting times, and status (Upcoming/Cancelled).

---

## 🧠 Architecture Choice (Next.js App Router)

This project utilizes the unified **Next.js App Router** architecture. By leveraging **Next.js Server Actions**, backend logic and database queries are executed securely within the same codebase. This choice provides end-to-end type safety, eliminates API boilerplate, and reduces latency in a serverless environment.

---

## 🛠️ Tech Stack

* **Frontend Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Database:** PostgreSQL (Hosted on Neon Serverless)
* **ORM:** Prisma
* **Styling:** Tailwind CSS + Shadcn UI
* **Icons:** Lucide React
* **Emails:** Resend API
* **Deployment:** Vercel

---

## ⚙️ Local Setup & Installation

**1. Clone the repository**
```js
git clone [https://github.com/deepbansal/deepcal.git](https://github.com/deepbansal/deepcal.git)
cd deepcal
```
**2. Install Dependencies**
```js
npm install
```
**3. Set Up Environment Variables**
```js
DATABASE_URL="your_postgresql_connection_string"
RESEND_API_KEY="your_resend_api_key"
```
**4. Push Database Schema**
```js
npx prisma db push
npx prisma generate
```
**5. Start the Development Server**
```js
npm run dev
```
The application will be available at:
http://localhost:3000