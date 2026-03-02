"use client";

import { useActionState, useRef, useState } from "react";

type Props = {
  roles: string[];
  clubs: { id: string; name: string; acronym: string }[];
  roleInfo: Record<string, { label: string; color: string }>;
  permissionGroups: {
    label: string;
    permissions: { key: string; label: string; description?: string }[];
  }[];
  rolePermissionPresets: Record<string, string[]>;
  createUserAction: (prevState: { ok: boolean; message: string }, formData: FormData) => Promise<{ ok: boolean; message: string }>;
};

export function CreateUserForm({ roles, clubs, roleInfo, permissionGroups, rolePermissionPresets, createUserAction }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, formAction] = useActionState(createUserAction, { ok: false, message: "" });

  const isClubAdminSelected = selectedRole === "club_admin";

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const permissionLabelMap = permissionGroups.reduce<Record<string, string>>((acc, group) => {
    group.permissions.forEach(permission => {
      acc[permission.key] = permission.label;
    });
    return acc;
  }, {});

  const roleBasedPermissions = selectedRole ? (rolePermissionPresets[selectedRole] || []) : [];

  const finalPermissions = Array.from(new Set([
    ...roleBasedPermissions,
    ...(useCustomPermissions ? selectedPermissions : [])
  ]));

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    let value = "";
    for (let i = 0; i < 12; i += 1) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }
    if (passwordRef.current) {
      passwordRef.current.value = value;
    }
    setGeneratedPassword(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!formRef.current) return;
    
    // Validation: if club_admin is selected, a club must be selected
    const orgSelect = formRef.current.querySelector('#create-orgId') as HTMLSelectElement | null;
    if (isClubAdminSelected && (!orgSelect || !orgSelect.value)) {
      e.preventDefault();
      setError("Vous devez sélectionner un club pour le rôle Admin Club");
      return;
    }
    
    setError(null);
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {!error && state.message && (
        <div className={`p-3 rounded-lg text-sm ${state.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {state.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="create-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input 
            type="email" 
            id="create-email" 
            name="email" 
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="nom@exemple.com"
          />
        </div>
        <div>
          <label htmlFor="create-displayName" className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
          <input 
            type="text" 
            id="create-displayName" 
            name="displayName" 
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Prénom Nom"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="create-password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Générer
            </button>
          </div>
          <input 
            type="text" 
            id="create-password" 
            name="password" 
            required
            minLength={6}
            ref={passwordRef}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="Min. 6 caractères"
          />
          {generatedPassword && (
            <div className="mt-1 text-xs text-gray-500">Mot de passe généré: {generatedPassword}</div>
          )}
        </div>
        <div>
          <label htmlFor="create-role" className="block text-sm font-medium text-gray-700 mb-1">Type de rôle</label>
          <select
            id="create-role"
            name="role-select"
            required
            value={selectedRole}
            onChange={(e) => {
              const role = e.target.value;
              setSelectedRole(role);
              if (role !== "club_admin") {
                setSelectedClubId("");
              }
              setError(null);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="" disabled>Sélectionnez un rôle</option>
            {roles.map((role) => {
              const info = roleInfo[role] || { label: role, color: "bg-gray-100 text-gray-700" };
              return (
                <option key={role} value={role}>
                  {info.label}
                </option>
              );
            })}
          </select>
          <input type="hidden" name="roles" value={selectedRole} />
          <input type="hidden" name="permissions" value={finalPermissions.join(',')} />
        </div>
      </div>
      
      <div className={isClubAdminSelected ? "" : "hidden"}>
        <label htmlFor="create-orgId" className="block text-sm font-medium text-gray-700 mb-1">
          Club <span className="text-red-500">*</span>
        </label>
        <select 
          id="create-orgId" 
          name="orgId"
          required={isClubAdminSelected}
          value={selectedClubId}
          className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          onChange={(e) => {
            setSelectedClubId(e.target.value);
            setError(null);
          }}
        >
          <option value="" disabled>
            Sélectionnez un club
          </option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name} ({club.acronym})
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-red-600">
            Un club doit être sélectionné pour le rôle Admin Club
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions par rôle</label>
        <div className="flex flex-wrap gap-2">
          {roleBasedPermissions.length === 0 ? (
            <span className="text-xs text-gray-500">Sélectionnez un rôle pour voir les permissions</span>
          ) : (
            roleBasedPermissions.map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700"
              >
                {permissionLabelMap[permission] || permission}
              </span>
            ))
          )}
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={useCustomPermissions}
            onChange={(e) => {
              setUseCustomPermissions(e.target.checked);
              if (!e.target.checked) {
                setSelectedPermissions([]);
              }
            }}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Ajouter des permissions personnalisées (optionnel)
        </label>
        {useCustomPermissions && (
          <div className="mt-3 space-y-3">
            {permissionGroups.map((group) => (
              <div key={group.label} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{group.label}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.permissions.map((permission) => {
                    const isChecked = selectedPermissions.includes(permission.key);
                    return (
                      <label key={permission.key} className={`inline-flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                        isChecked ? 'bg-brand-50 ring-2 ring-brand-500' : ''
                      }`}>
                        <input
                          type="checkbox"
                          name="permission-checkbox"
                          value={permission.key}
                          checked={isChecked}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-xs font-semibold text-gray-700">{permission.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <input type="hidden" name="permissions" id="create-permissions" />
      </div>
      
      <button 
        type="submit"
        className="inline-flex items-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 focus:ring-2 focus:ring-brand-500/20 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Créer l'utilisateur
      </button>
    </form>
  );
}
