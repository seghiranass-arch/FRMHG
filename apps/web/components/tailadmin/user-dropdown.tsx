"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Dropdown } from "./dropdown";

type Props = {
  name: string;
  email: string;
};

export function UserDropdown({ name, email }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsOpen((p) => !p);
  }
  function closeDropdown() {
    setIsOpen(false);
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="dropdown-toggle flex items-center text-gray-700">
        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full">
          <Image
            width={44}
            height={44}
            src="/images/user/owner.jpg"
            alt="User"
            className="h-11 w-11 object-cover"
          />
        </span>

        <span className="mr-1 block font-medium text-theme-sm">{name}</span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg"
      >
        <div>
          <span className="block text-theme-sm font-medium text-gray-700">{name}</span>
          <span className="mt-0.5 block text-theme-xs text-gray-500">{email}</span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-4">
          <li>
            <a
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100"
              href="/profile"
            >
              Mon profil
            </a>
          </li>
        </ul>

        <button
          onClick={signOut}
          className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Déconnexion
        </button>
      </Dropdown>
    </div>
  );
}








