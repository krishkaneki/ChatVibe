import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import SocketProvider from "@/providers/SocketProvider";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SocketProvider>
      <div
        className="flex h-screen w-full bg-surface-container-lowest overflow-hidden min-h-0"
        style={{ height: "100dvh" }}
      >
        <Sidebar session={session} />
        {/* Main content — on mobile, full width with padding-top for hamburger */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 pt-0 md:pt-0">
          {children}
        </main>
      </div>
    </SocketProvider>
  );
}
