import { PublicNav } from "../../components/public-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      
      <main className="container mx-auto px-4 py-8 md:px-6 relative z-10">
        {children}
      </main>
      
      <footer className="mt-12 border-t border-gray-200 bg-white py-8 text-center">
        <p className="text-xs font-medium text-gray-400">
          © {new Date().getFullYear()} FRMHG — Fédération Royale Marocaine de Hockey sur Glace
        </p>
      </footer>
    </div>
  );
}
