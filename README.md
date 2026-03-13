# 🗓️ DeepCal - Modern Scheduling Infrastructure

**🚀 Live Demo:** [https://deep-cal.vercel.app/]

DeepCal is a full-stack scheduling platform meticulously designed to replicate the sleek, user-centric interface and functionality of **Cal.com**. It empowers users to define availability, create custom event types, and seamlessly manage incoming bookings without the back-and-forth of traditional email scheduling.

---

## ✨ Core Features & UI Implementation :

* **Cal.com UI/UX Architecture:** The interface patterns, typography, sticky sidebars, and clean dashboard layouts were heavily inspired by studying Cal.com's live design system to ensure a premium, intuitive user experience.
* **Conflict-Free Scheduling Engine:** A robust, dynamic algorithm calculates available time slots on the fly. It cross-references the host's base availability with existing database bookings to guarantee zero double-bookings.
* **The "Force Field" Buffer System:** Advanced padding logic that automatically enforces custom rest periods (e.g., 5, 15, or 30 minutes) before and after scheduled meetings to prevent burnout and back-to-back overlaps.
* **Dynamic Event Type Management:** Support for generating multiple meeting configurations. Users can customize durations, set unique URL slugs, and assign color identifiers for visual organization.
* **Automated Email Confirmations (Resend API):** Integrated with Resend to deliver beautifully formatted HTML confirmation emails instantly upon booking. 
  * *Note on API Limitations:* Due to the Resend Free Tier strict anti-spam policies and API cost constraints, automated emails are currently restricted to sending only to the developer's verified email address. In a production environment with a paid tier, this dynamically scales to any guest email.
* **Granular Availability Controls:** A matrix-style availability manager allowing the host to dictate their exact weekly working hours.
* **Theme Customization:** Seamless Light/Dark mode toggling built into the dashboard for accessibility and user preference.

---

## 📌 Assumptions Made (As per Requirements)

* **Authentication Bypass:** No user login system (like NextAuth or Clerk) has been implemented. The system operates under the assumption that a `defaultuser` is continuously logged into the admin dashboard side.
* **Public Access:** The public-facing booking page (`/[username]`) is accessible to anyone on the internet without requiring them to create a guest account.
* **Pre-seeded Environment:** The database contains sample event types and dummy bookings to demonstrate immediate functionality upon evaluation.

---

## 🗄️ Database Design (Prisma + PostgreSQL)

The database schema was custom-designed from scratch to handle relational scheduling logic efficiently. The core tables include:
1. **User:** Holds the primary account (`defaultuser`) and their baseline settings.
2. **EventType:** Relates to the User. Stores meeting metadata (Title, Duration, URL Slug, Color, and Buffer Times).
3. **Availability:** Relates to the User. Stores a 7-day schedule matrix indicating which days/hours the user is actively accepting meetings.
4. **Booking:** Relates to the EventType. Stores guest details, meeting start/end times, and status (Upcoming/Cancelled).

*Note: The scheduling algorithm uses these relational tables to dynamically calculate overlaps and enforce buffer times on the fly.*

---

## 🧠 Architecture Choice (Next.js App Router)

This project utilizes the unified **Next.js App Router** architecture rather than a traditional decoupled setup (React frontend + separate Express.js server). 

By leveraging **Next.js Server Actions**, backend logic and database queries are executed securely within the same codebase. This architectural choice provides end-to-end type safety between the Prisma schema and the frontend components, eliminates REST API boilerplate, and reduces latency by hosting both client and server logic in a single serverless Vercel deployment.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Database:** PostgreSQL (Hosted on Neon Serverless)
* **ORM:** Prisma
* **Styling:** Tailwind CSS + Shadcn UI
* **Emails:** Resend API
* **Deployment:** Vercel

---

## ⚙️ Local Setup & Installation

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/deepcal.git](https://github.com/yourusername/deepcal.git)
cd deepcal
