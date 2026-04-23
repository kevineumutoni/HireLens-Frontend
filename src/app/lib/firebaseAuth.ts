"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/app/config/firebaseConfig";

export async function googleSignIn(): Promise<{ user: any; token: string }> {
  const cred = await signInWithPopup(auth, googleProvider);

  const token = await cred.user.getIdToken();

  const user = {
    email: cred.user.email || "",
    name: cred.user.displayName || (cred.user.email ? cred.user.email.split("@")[0] : "User"),
    role: "recruiter" as const,
  };

  return { user, token };
}