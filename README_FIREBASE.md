# Gajrani Inter College — Firebase Website

Project ID: `gajrani-inter-college`

## 1. Enable Firebase services
Firebase Console → project `gajrani-inter-college`:
- Authentication → Sign-in method → enable Email/Password
- Firestore Database → Create database
- Storage → Get started

## 2. Create the first admin
Authentication → Users → Add user with an email/password.
Copy that user's UID.

Firestore Database → create collection `admins` → create document with the exact document ID equal to the user's UID.
Fields:
- `active` : boolean `true`

The admin panel will reject authenticated users who do not have this document.

## 3. Deploy
Install Firebase CLI if needed, then from this folder:

    firebase login
    firebase use gajrani-inter-college
    firebase deploy

This deploys Hosting plus the Firestore and Storage rules.

## 4. URLs after hosting
- Website: the Hosting URL shown by Firebase
- Admin: append `/admin.html`

## Important
The Firebase Web config in `firebase-config.js` is client-side configuration. Never put a Firebase service-account private key in this project.
