# 💅 Lucy Nailed It — Booking & Salon Management Platform

A full-stack appointment-booking web application built for **Lucy Nailed It**, combining a polished React frontend with a secure Node.js / Express backend, integrated with **Square APIs** and **FullCalendar** for real-time scheduling, team management, and service listings.  
Deployed on **Google Cloud (Ubuntu + Nginx + PM2)** with SSL via **Let's Encrypt**.

---

## Features

### Frontend (React + FullCalendar)
- Interactive appointment calendar powered by **FullCalendar.js**
  - Displays existing bookings and available times dynamically
  - Integrated with the backend `/api/bookings` endpoint
  - Supports add/delete events with immediate UI updates
- Smooth navigation with **React Router + HashLink**
- **Authentication modals** for login/register using JWT tokens
- Responsive design for desktop and mobile
- Integrated sections:
  - About
  - Services
  - Gallery
  - Contact

### Backend (Node.js + Express + MongoDB)
- REST API routes under `/api/*`
- **Auth system** for registration, login, and user persistence
- **FullCalendar integration:**
  - `/api/bookings` GET — returns all bookings (for calendar rendering)
  - `/api/bookings` POST — creates a new booking (added to calendar)
  - `/api/bookings/:id` DELETE — cancels a booking (removes from calendar)
  - Uses `DateTime` from `luxon` for timezone-safe ISO timestamps
- **Square API** integration:
  - Locations, Team Members, and Catalog items pulled dynamically
- **Nodemailer** setup for email confirmations:
  - Sends booking confirmations to users
  - Sends notifications to the salon owner

### Deployment (Google Cloud)
- Nginx reverse proxy routes:
  - `https://lucynailedit.twilightparadox.com` → React app
  - `https://api.lucynailedit.twilightparadox.com` → Express backend
- SSL certificates via **Certbot**
- **PM2** for backend process management and auto-start on reboot

---

## Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, FullCalendar.js, React Router, HashLink |
| **Backend** | Node.js, Express, Mongoose, Luxon, Nodemailer |
| **Database** | MongoDB |
| **Integrations** | Square API (Bookings, Catalog, Team), FullCalendar |
| **Deployment** | Nginx, PM2, Google Cloud, Let's Encrypt |
| **Version Control** | Git + GitHub |

