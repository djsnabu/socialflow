import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
          <Header />
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 28px",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
