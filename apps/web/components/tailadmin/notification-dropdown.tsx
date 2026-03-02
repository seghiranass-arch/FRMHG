"use client";

import Image from "next/image";
import * as React from "react";

import { Dropdown } from "./dropdown";
import { DropdownItem } from "./dropdown-item";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifying, setNotifying] = React.useState(true);

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleClick() {
    setIsOpen((p) => !p);
    setNotifying(false);
  }

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-brand-secondary ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-secondary opacity-75"></span>
        </span>
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
          <h5 className="text-lg font-semibold text-gray-800">Notifications</h5>
          <button onClick={handleClick} className="dropdown-toggle text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <ul className="flex h-auto flex-col overflow-y-auto">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100"
            >
              <span className="relative block h-10 w-full max-w-10 rounded-full">
                <Image
                  width={40}
                  height={40}
                  src="/images/user/user-02.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-success-500"></span>
              </span>

              <span className="block">
                <span className="mb-1.5 block space-x-1 text-theme-sm text-gray-500">
                  <span className="font-medium text-gray-800">Paiement</span>
                  <span>en attente de validation</span>
                </span>
                <span className="flex items-center gap-2 text-theme-xs text-gray-500">
                  <span>Finance</span>
                  <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                  <span>à l’instant</span>
                </span>
              </span>
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}








