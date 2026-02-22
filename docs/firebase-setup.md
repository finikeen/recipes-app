# Firebase Setup Guide

This guide walks you through connecting the Rezipees app to a Firebase project. It is written for developers who have not used Firebase before.

---

## Prerequisites

- A Google account (required to access the Firebase Console)
- Node.js 18 or later and npm installed locally

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Add project** (or **Create a project**).
3. Enter a project name, for example `rezipees`.
4. On the next screen you can enable or disable Google Analytics — it is not required by this app, so you can disable it if you prefer.
5. Click **Create project** and wait for provisioning to finish.
6. Click **Continue** to open the project dashboard.

---

## 2. Enable Email/Password Authentication

1. In the left sidebar, click **Build > Authentication**.
2. Click the **Get started** button if prompted.
3. Select the **Sign-in method** tab.
4. Click **Email/Password** in the list of providers.
5. Toggle the first switch to **Enabled**.
6. Leave the "Email link (passwordless sign-in)" option disabled.
7. Click **Save**.

---

## 3. Create a Firestore Database

1. In the left sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a database location closest to your users (the default suggestion is fine for development).
4. On the "Secure rules" screen, select one of:
   - **Start in production mode** — recommended. All access is denied by default; you will apply the app's rules in step 7.
   - **Start in test mode** — allows all reads and writes for 30 days. Convenient for quick local testing, but remember to tighten the rules before going live.
5. Click **Create** and wait for the database to be provisioned.

---

## 4. Register a Web App and Get Credentials

1. From the project dashboard, click the web icon ( `</>` ) under "Get started by adding Firebase to your app", or go to **Project settings** (gear icon next to "Project Overview") and scroll down to the **Your apps** section and click **Add app > Web**.
2. Enter a nickname such as `rezipees-web`.
3. Leave "Also set up Firebase Hosting" unchecked unless you intend to deploy through Firebase.
4. Click **Register app**.
5. Firebase will display a `firebaseConfig` object similar to:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "rezipees.firebaseapp.com",
     projectId: "rezipees",
     storageBucket: "rezipees.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

   Keep this screen open — you will copy these values in the next step.

6. Click **Continue to console** when done.

> You can always retrieve these values later from **Project settings > Your apps > SDK setup and configuration**.

---

## 5. Configure the App

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and replace each placeholder with the corresponding value from the `firebaseConfig` object you obtained in step 4:

```dotenv
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=rezipees.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=rezipees
VITE_FIREBASE_STORAGE_BUCKET=rezipees.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> `.env.local` is listed in `.gitignore` and will never be committed to version control. Never commit real credentials.

---

## 6. Apply Firestore Security Rules

The app's security rules restrict each user to reading and writing only their own recipes. See [`docs/firestore-security-rules.md`](./firestore-security-rules.md) for the full rules and an explanation of each permission.

To apply the rules:

1. Go to **Build > Firestore Database** in the Firebase Console.
2. Click the **Rules** tab.
3. Copy the rules from `docs/firestore-security-rules.md` and paste them into the editor, replacing the existing content.
4. Click **Publish**.

> If you chose "Start in test mode" in step 3, replace the default test rules with the production rules now to avoid leaving your data open.

---

## 7. Run the App

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Rezipees home page. Create an account via the Sign In page to verify that Firebase Authentication is working correctly.

---

## 8. Run the Tests

```bash
npm run test
```

The test suite uses [Vitest](https://vitest.dev/). All tests should pass after a successful Firebase configuration.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `auth/configuration-not-found` error in the browser console | Email/Password sign-in method is not enabled | Revisit step 2 and enable the provider |
| `Missing or insufficient permissions` Firestore error | Security rules are still in default/test mode or have not been published | Follow step 6 to apply the app's rules |
| Environment variables are `undefined` at runtime | `.env.local` is missing or variable names do not start with `VITE_` | Confirm the file exists at the project root and all keys match the names in `.env.example` |
| Vite dev server does not pick up `.env.local` changes | `.env.local` was edited while the server was running | Stop the server (`Ctrl+C`) and run `npm run dev` again |
