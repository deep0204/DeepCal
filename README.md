# 🗓️ DeepCal - Modern Scheduling Infrastructure

**🚀 Live Demo:** [https://deep-cal.vercel.app/] 

[cite_start]DeepCal is a full-stack scheduling platform meticulously designed to replicate the sleek, user-centric interface and functionality of **Cal.com**[cite: 1]. It empowers users to define availability, create custom event types, and seamlessly manage incoming bookings without the back-and-forth of traditional email scheduling.

---

## ✨ Core Features & UI Implementation

* [cite_start]**Cal.com UI/UX Architecture:** The interface patterns, typography, and clean dashboard layouts were heavily inspired by studying Cal.com's live design system[cite: 1]. This includes minimalist event cards, real-time search filtering, and a professional, date-grouped horizontal bookings list.
* **Date Overrides & Custom Availability:** Beyond a standard weekly schedule, hosts can block out specific dates (e.g., vacations) or set custom hours for specific days. The scheduling engine dynamically adapts to these overrides in real-time.
* [cite_start]**Conflict-Free Scheduling Engine:** A robust, dynamic algorithm calculates available time slots on the fly[cite: 1]. [cite_start]It cross-references the host's base availability and date overrides with existing database bookings to guarantee zero double-bookings[cite: 1].
* [cite_start]**Dynamic Timezone Support:** Built-in timezone selection using the browser's native `Intl` API, allowing the host to set their specific local timezone for accurate slot generation[cite: 1].
* [cite_start]**The "Force Field" Buffer System:** Advanced padding logic that automatically enforces custom rest periods (e.g., 5, 15, or 30 minutes) before and after scheduled meetings to prevent burnout and back-to-back overlaps[cite: 1].
* [cite_start]**Dynamic Event Type Management:** Support for generating multiple meeting configurations[cite: 1]. [cite_start]Users can customize durations, set unique URL slugs[cite: 1], assign color identifiers, and instantly toggle events active/inactive.
* **Real-time Search & Filtering:** A lightning-fast client-side search bar on the dashboard to instantly filter event types by title or URL slug.
* [cite_start]**Automated Email Confirmations (Resend API):** Integrated with Resend to deliver beautifully formatted HTML confirmation emails instantly upon booking[cite: 1]. *(Note: Due to Resend's Free Tier anti-spam policies, automated emails are currently restricted to sending only to the developer's verified email address).*

---

## 📌 Assumptions Made (As per Requirements)

* [cite_start]**Authentication Bypass:** No user login system (like NextAuth or Clerk) has been implemented[cite: 1]. [cite_start]The system operates under the assumption that a `defaultuser` is continuously logged into the admin dashboard side[cite: 1].
* [cite_start]**Public Access:** The public-facing booking page (`/[username]`) is accessible to anyone on the internet without requiring them to create a guest account[cite: 1].
* **Timezone Architecture:** The database strictly stores all booking times in `UTC`. Timezone-aware slot conversion relies on the host's selected timezone settings to accurately display availability.
* [cite_start]**Pre-seeded Environment:** The database contains sample event types and dummy bookings to demonstrate immediate functionality upon evaluation[cite: 1].

---

## 🗄️ Database Design (Prisma + PostgreSQL)

[cite_start]The database schema was custom-designed from scratch to handle relational scheduling logic efficiently[cite: 1]. The core tables include:
1. **User:** Holds the primary account (`defaultuser`) and their baseline settings (including their saved Timezone).
2. **EventType:** Relates to the User. [cite_start]Stores meeting metadata (Title, Duration, URL Slug, Color, and Buffer Times)[cite: 1].
3. **Availability:** Relates to the User. [cite_start]Stores a 7-day schedule matrix indicating which days/hours the user is actively accepting meetings[cite: 1].
4. **DateOverride:** Relates to the User. Stores specific dates with custom start/end times (or full-day unavailability flags) that supersede the standard weekly availability.
5. **Booking:** Relates to the EventType. [cite_start]Stores guest details, meeting start/end times, and status (Upcoming/Cancelled)[cite: 1].

*Note: The scheduling algorithm uses these relational tables to dynamically calculate overlaps, enforce buffer times, and apply date overrides on the fly.*

---

## 🧠 Architecture Choice (Next.js App Router)

This project utilizes the unified **Next.js App Router** architecture rather than a traditional decoupled setup (React frontend + separate Express.js server). 

By leveraging **Next.js Server Actions**, backend logic and database queries are executed securely within the same codebase. This architectural choice provides end-to-end type safety between the Prisma schema and the frontend components, eliminates REST API boilerplate, and reduces latency by hosting both client and server logic in a single serverless Vercel deployment.

---

## 🛠️ Tech Stack

* [cite_start]**Frontend Framework:** Next.js 14 (App Router) [cite: 1]
* **Language:** TypeScript
* [cite_start]**Database:** PostgreSQL (Hosted on Neon Serverless) [cite: 1]
* **ORM:** Prisma
* **Styling:** Tailwind CSS + Shadcn UI
* **Icons:** Lucide React
* **Emails:** Resend API
* [cite_start]**Deployment:** Vercel [cite: 1]

---

## ⚙️ Local Setup & Installation

**1. Clone the repository**
```bash
git clone [https://github.com/deepbansal/deepcal.git](https://github.com/deepbansal/deepcal.git)
cd deepcal