# ConnectFlow | Modern Contact Management App

ConnectFlow is a high-performance, aesthetically pleasing contact management application built with the **MEVN stack** (replacing Vue with Vanilla JS for ultimate lightweight control). Features include full CRUD capability, search, favoriting, and a premium glassmorphic UI.

## 🚀 Features
- **Dynamic Contact Hub**: Search through your contacts instantly by name, email, or phone.
- **Glassmorphic UI**: Experience a modern, premium design with translucent elements and smooth transitions.
- **Quick Favorites**: Toggle important contacts as favorites with a single tap.
- **Smart Avatars**: Automatically generates high-quality avatars based on contact names if no image URL is provided.
- **Full REST API**: Clean and robust backend built with Express and MongoDB.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Frontend**: Pure HTML5, CSS3 (Vanilla), Vanilla JavaScript (ES6+)
- **Icons & Fonts**: Font Awesome, Google Fonts (Outfit)

## 🚀 Quick Start (Zero-Error Checklist)

1.  **Dependencies**: Run `npm install`
2.  **Database**: Ensure MongoDB is running on `localhost:27017`.
    *   *Tip*: If using MongoDB Atlas, replace the URI in `.env` with your Atlas connection string.
3.  **Start Server**: Run `npm run dev`
4.  **Open the App**: 
    👉 **Crucial**: Do NOT double-click `index.html`. Open [http://localhost:5000](http://localhost:5000) in your browser.

## 🛠️ Troubleshooting "Network Error"
If you see a "Protocol Error" or "Network Error":
- Check if the URL in your browser starts with `http://`. If it starts with `file://`, you are opening the file incorrectly.
- Ensure the terminal running `npm run dev` says `Connected to MongoDB successfully`.

## 📡 API & Testing
You can seed sample data instantly by sending a POST request to `/api/contacts/seed` or just use the UI!

---
Developed with ❤️ for HR Submission.
