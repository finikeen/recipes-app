# Firestore Security Rules

This document describes the Firestore security rules for the Rezipees application. Anyone can read all recipes, but users can only write (create, update, delete) their own recipes. Authentication is only required for creating, updating, or deleting.

## Overview

All rules are scoped to the `recipes` collection. Read access is open to all users (authenticated or not). Write access is restricted to authenticated users who own the document by comparing their UID (`request.auth.uid`) against the `userId` field stored on each document.

## Rules Summary

### Recipe documents (`/recipes/{recipeId}`)

| Operation | Condition |
|-----------|-----------|
| `read`    | Public access (no authentication required) |
| `create`  | User is authenticated and the new document's `userId` matches their UID |
| `update`  | User is authenticated and owns the existing document |
| `delete`  | User is authenticated and owns the document |

### Ingredients subcollection (`/recipes/{recipeId}/ingredients/{ingredientId}`)

| Operation | Condition |
|-----------|-----------|
| `read`    | Public access (no authentication required) |
| `write`   | User is authenticated and owns the parent recipe (verified via `get()`) |

Ingredient documents do not carry a `userId` field themselves, so ownership is established by looking up the parent recipe document.

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{recipeId} {
      allow read: if true;
      allow create: if request.auth.uid != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth.uid != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth.uid != null && resource.data.userId == request.auth.uid;

      match /ingredients/{ingredientId} {
        allow read: if true;
        allow write: if request.auth.uid != null &&
          get(/databases/$(database)/documents/recipes/$(recipeId)).data.userId == request.auth.uid;
      }
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
