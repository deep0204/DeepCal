# 🗓️ DeepCal - Modern Scheduling Infrastructure

DeepCal is a full-stack, high-performance scheduling platform inspired by Cal.com and Calendly. It allows users to create custom event types, set availability, and let guests book time slots without the back-and-forth emails. 

**🚀 Live Demo:** [https://deep-cal.vercel.app/]

---

## ✨ Core Features

* **Smart Time-Slot Generation:** An algorithmic scheduling engine that calculates available slots on the fly, preventing any possibility of double-booking.
* **The "Force Field" Buffer System:** Automatically blocks out custom rest periods (e.g., 15 minutes) before and after meetings to prevent burnout.
* **Dynamic Event Types:** Create multiple meeting types (e.g., 15-min Quick Chat, 60-min Deep Work) with custom URLs, durations, and color-coding.
* **Real-Time Email Confirmations:** Integrated with Resend API to automatically fire beautifully formatted HTML email confirmations to guests upon booking.
* **Availability Management:** Set standard weekly working hours that dictate the baseline schedule.
* **Modern Dashboard:** Built with a sticky sidebar, fully responsive mobile design, and an automatic Light/Dark theme toggle.

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

## 🧠 Architecture Insight: Where is Express.js?

If you are looking for an Express.js server folder in this repository, you won't find one! 

DeepCal is built using the bleeding-edge **Next.js App Router** architecture. Instead of spinning up a separate Express.js backend and writing traditional REST API endpoints (`app.get`, `app.post`), this project utilizes **Next.js Server Actions**.

**Why this is better:**
1. **Zero API Boilerplate:** Frontend forms call asynchronous server functions directly (`'use server'`).
2. **End-to-End Type Safety:** TypeScript interfaces are shared seamlessly between the database schema and the client UI. If a database column changes (like adding `bufferTime`), the frontend instantly knows about it.
3. **Reduced Latency:** The server and frontend are tightly coupled in a single deployment on Vercel, removing the network hop between a separate frontend host and an Express backend host.

---

## ⚙️ Local Setup & Installation

Want to run DeepCal on your local machine? Follow these steps:

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/deepcal.git](https://github.com/yourusername/deepcal.git)
cd deepcal
