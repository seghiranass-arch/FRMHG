"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("frmhg_token")?.value;
}

async function getApiUrl() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const rawApiUrl =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:3001";
  const normalizedPath = rawApiUrl.startsWith("/") ? rawApiUrl : `/${rawApiUrl}`;
  return rawApiUrl.startsWith("http")
    ? rawApiUrl
    : `${protocol}://${host}${normalizedPath}`;
}

export async function updateProfile(userId: string, formData: FormData) {
  const displayName = formData.get("displayName") as string;
  const token = await getAuthToken();
  if (!token) return { error: "Non authentifié" };

  const apiUrl = await getApiUrl();
  const response = await fetch(`${apiUrl}/iam/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ displayName }),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      return { error: errorData.message || "Erreur lors de la mise à jour du profil" };
    } catch {
      return { error: "Erreur lors de la mise à jour du profil" };
    }
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function changePassword(userId: string, formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  const token = await getAuthToken();
  if (!token) return { error: "Non authentifié" };

  const apiUrl = await getApiUrl();
  const response = await fetch(`${apiUrl}/iam/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      return { error: errorData.message || "Erreur lors du changement de mot de passe" };
    } catch {
      return { error: "Erreur lors du changement de mot de passe" };
    }
  }

  return { success: true };
}
