# Firestore Security Rules

This document describes the Firestore security rules for the Rezipees application. These rules ensure that users can only access and modify their own recipe data.

## Overview

All rules are scoped to the `recipes` collection. Access is controlled by comparing the authenticated user's UID (`request.auth.uid`) against the `userId` field stored on each document.

## Rules Summary

| Operation | Condition |
|-----------|-----------|
| `read`    | User is authenticated and owns the document (`resource.data.userId == request.auth.uid`) |
| `create`  | User is authenticated and the new document's `userId` matches their UID (`request.resource.data.userId == request.auth.uid`) |
| `update`  | User is authenticated and owns the existing document (`resource.data.userId == request.auth.uid`) |
| `delete`  | User is authenticated and owns the document (`resource.data.userId == request.auth.uid`) |

## Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{document=**} {
      allow read: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth.uid != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Deployment Instructions

To apply these rules in the Firebase Console:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and open your project.
2. In the left sidebar, navigate to **Build > Firestore Database**.
3. Click the **Rules** tab at the top of the Firestore page.
4. Replace the existing rules with the rules shown in the code block above.
5. Click **Publish** to save and deploy the rules immediately.

> **Note:** Rule changes take effect within a few minutes of publishing. Test your rules using the **Rules Playground** tab in the Firebase Console before deploying to production.
