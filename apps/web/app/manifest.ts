import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FRMHG — Plateforme de gestion",
    short_name: "FRMHG",
    description: "Plateforme de gestion — Fédération Royale Marocaine de Hockey sur Glace",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    icons: [
      {
        src: "/logo_frmhg.png",
        sizes: "any",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo_frmhg.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}

