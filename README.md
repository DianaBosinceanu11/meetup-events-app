# Meetup & Events App 🎉

A web application for finding and booking social events, developed using **React (Next.js)** and **Firebase**.

## 📌 Features
✅ Search for events by category  
✅ Book and manage event reservations  
✅ Admin dashboard to manage events  
✅ Interactive map with event locations (Leaflet.js)  
✅ Firebase authentication for user login  
✅ Fully responsive design  

## 🛠️ Tech Stack
- **Frontend**: React (Next.js)
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Maps**: Leaflet.js (without `react-leaflet`)
- **CSS**: Styled with modern UI  

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/DianaBosinceanu11/meetup-events-app.git
cd meetup-events-app
"# Meetup & Events App" 


2️⃣ Install Dependencies
npm install
# or if using Yarn
yarn install

3️⃣ Setup Firebase Configuration
Create a Firebase project on Firebase Console.
Enable Firestore Database and Authentication (Email/Password).
Create a .env.local file in the project root with your Firebase credentials:

📌 **Firebase Credentials**
The `.env.local` file containing Firebase credentials is **not included in this repository for security reasons**.  
However, it **will be provided separately in the assignment submission** as `firebase_credentials.txt`.  

To use Firebase:  
1️⃣ Rename `firebase_credentials.txt` to `.env.local`  
2️⃣ Move it to the project **root folder**  
3️⃣ Run the application 🚀  




4️⃣ Run the Development Server
npm run dev
# or
yarn dev

🚀 Open http://localhost:3000/ in your browser.


🔥 Firebase Setup Guide
1️⃣ Firestore Database Rules
Make sure your Firestore database has the following security rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users Collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Events Collection
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

2️⃣ Authentication Setup
Enable Email & Password authentication in Firebase Auth settings.


📁 Folder Structure

meetup-app
│── components        # Reusable UI components
│   ├── EventCard.js  
│   ├── EventList.js  
│   ├── MapComponent.js  
│   ├── Navbar.js  
│   ├── SearchBar.js  
│── pages             # Next.js pages  
│   ├── _app.js       # Global app wrapper  
│   ├── _document.js  # Custom document structure  
│   ├── index.js      # Homepage  
│   ├── login.js      # User login  
│   ├── signup.js     # User registration  
│   ├── bookings.js   # User booking history  
│   ├── add-event.js  # Admin event creation  
│   ├── admin.js      # Admin dashboard  
│   ├── edit-event/[id].js # Edit event page (dynamic routing)  
│── public            # Static assets (images, icons)  
│── styles            # Global and component-level CSS  
│── firebase.js       # Firebase config & initialization  
│── .gitignore        # Ignoring sensitive files  
│── next.config.js    # Next.js config  
│── package.json      # Project dependencies  



🛠️ Admin Features
👤 Admin users can:
✅ Create events (with date, location, description)
✅ Edit existing events
✅ Delete events
✅ Manage all bookings

📌 How to make a user an admin?
In Firestore, update the users collection

{
  "uid": "123456",
  "email": "admin@example.com",
  "role": "admin"
}


🗺️ Map Integration (Leaflet.js)
📌 The app uses Leaflet.js to display event locations without using third-party React libraries.
✅ Custom marker icons to improve visibility.
✅ Users can click markers to see event details.


🚀 Deployment Guide
1️⃣ Deploy on Vercel (Recommended)

npm install -g vercel
vercel login
vercel


2️⃣ Deploy on Firebase Hosting

firebase login
firebase init
firebase deploy


🛠️ Possible Future Improvements
✔ Add user profiles for managing account settings
✔ Implement event reminders via email notifications
✔ Allow event organizers to upload images
✔ Improve map markers with custom styles

📜 License
This project is MIT Licensed. Feel free to use, modify, and distribute it.


🎉 Acknowledgements
🙏 Thanks to Solent University for the module on Contemporary Web Applications.
💡 Inspired by popular event-booking platforms.


🔗 Author & Contact
👩‍💻 Diana Bosinceanu
📩 Email: dianabosinceanu11@gmail.com
📌 GitHub: DianaBosinceanu11


🚀 Enjoy building & booking events! 🎉
