'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_INTERNAL_URL || "http://localhost:3001";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("frmhg_token")?.value;
}

export type Event = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: string;
  targetRoles: string[];
  createdById: string;
  createdBy: {
    displayName: string;
  };
  participants: {
    user: {
      id: string;
      displayName: string;
      email: string;
    };
  }[];
};

export type CreateEventData = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type?: string;
  targetRoles?: string[];
  participantIds?: string[];
};

export type UpdateEventData = Partial<CreateEventData>;

export async function getEvents() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch events:", await res.text());
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function createEvent(data: CreateEventData) {
  const token = await getAuthToken();
  if (!token) return { error: "Non authentifié" };

  try {
    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: text || "Erreur lors de la création de l'événement" };
    }

    revalidatePath("/modules/calendrier");
    return { success: true };
  } catch (error) {
    return { error: "Erreur serveur" };
  }
}

export async function updateEvent(id: string, data: UpdateEventData) {
  const token = await getAuthToken();
  if (!token) return { error: "Non authentifié" };

  try {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return { error: "Erreur lors de la modification de l'événement" };
    }

    revalidatePath("/modules/calendrier");
    return { success: true };
  } catch (error) {
    return { error: "Erreur serveur" };
  }
}

export async function deleteEvent(id: string) {
  const token = await getAuthToken();
  if (!token) return { error: "Non authentifié" };

  try {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { error: "Erreur lors de la suppression de l'événement" };
    }

    revalidatePath("/modules/calendrier");
    return { success: true };
  } catch (error) {
    return { error: "Erreur serveur" };
  }
}

export async function getMatches() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/sport/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

export async function getUsers() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/iam/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
