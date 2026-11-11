import Link from "next/link";
import LoginPage from "../app/login/page";

const roleNames: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export default async function PortalRoute({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const [section, ...subsection] = path;

  if (section === "login") {
    return <LoginPage />;
  }

  const role = roleNames[section] ?? "Portal";
  const sectionName = subsection.length
    ? subsection.join(" / ").replaceAll("-", " ")
    : "Dashboard";

  return (
    <main className="portal-page">
      <header className="portal-header">
        <Link className="brand" href="/">PMS</Link>
        <div>
          <p className="eyebrow">Performance Management System</p>
          <h1>{role} {sectionName}</h1>
        </div>
        <Link className="logout-link" href="/login">Log out</Link>
      </header>
      <section className="portal-content">
        <p className="eyebrow">Workspace</p>
        <h2>{sectionName === "Dashboard" ? `Welcome to your ${role.toLowerCase()} dashboard` : sectionName}</h2>
        <p className="portal-description">
          This section is ready for your performance goals, feedback, and team
          workflows. Use the navigation below to explore the available areas.
        </p>
        <nav className="portal-links" aria-label="Portal sections">
          <Link href="/admin">Admin</Link>
          <Link href="/manager">Manager</Link>
          <Link href="/employee">Employee</Link>
          <Link href="/admin/users">Manage users</Link>
          <Link href="/admin/departments">Departments</Link>
          <Link href="/admin/kpis">KPIs</Link>
          <Link href="/admin/security">Security</Link>
          <Link href="/manager/goals">Goals</Link>
          <Link href="/manager/evaluations">Evaluations</Link>
          <Link href="/manager/feedback">Feedback</Link>
          <Link href="/employee/okrs">OKRs</Link>
          <Link href="/employee/feedback">Feedback</Link>
        </nav>
      </section>
    </main>
  );
}