import { getServerUser } from "../../lib/server-auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export default async function ProfilePage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 font-barlow">Mon profil</h1>
        <p className="text-gray-500">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileForm user={user} />
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-blue-800 font-semibold mb-2">Rôles et permissions</h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role: string) => (
                <span key={role} className="px-3 py-1 bg-white text-blue-700 text-sm font-medium rounded-lg border border-blue-100 shadow-sm">
                  {role}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-blue-600">
              Ces rôles déterminent vos accès aux différentes sections de la plateforme. Contactez un administrateur pour modifier vos permissions.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <PasswordForm user={user} />
        </div>
      </div>
    </div>
  );
}
