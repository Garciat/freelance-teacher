import { BaseLayout, BaseLayoutProps } from "@/app/pages/_layouts/base.tsx";
import { UserSession } from "@/app/pages/_types.ts";

export type PageLayoutProps = BaseLayoutProps;

const nav = [
  { label: "Home", href: "/", kind: "user" as const },
  { label: "Business", href: "/business/", kind: "user" as const },
  { label: "Students", href: "/students/", kind: "user" as const },
  { label: "Invoices", href: "/invoices/", kind: "user" as const },
  { label: "Logout", href: "/auth/logout", kind: "user" as const },
  { label: "Login", href: "/auth/login", kind: "anon" as const },
];

function isVisible(
  user: UserSession | undefined | null,
  kind: "all" | "user" | "anon",
): boolean {
  switch (kind) {
    case "all":
      return true;
    case "user":
      return Boolean(user);
    case "anon":
      return !user;
  }
}

export const PageLayout: React.FC<PageLayoutProps> = (
  { title, user, children },
) => (
  <BaseLayout title={title}>
    <main>
      <header className="site-navigation">
        <h1>Freelance Teacher</h1>
        <nav>
          <ul>
            {nav.map((item) =>
              isVisible(user, item.kind) && (
                <li key={item.href}>
                  <a href={item.href}>
                    <span>{item.label}</span>
                  </a>
                </li>
              )
            )}
          </ul>
        </nav>
      </header>
      <div className="content">
        <h2>{title}</h2>
        {children}
      </div>
      <footer>
        <p className="text-center">This is the footer (:</p>
      </footer>
    </main>
  </BaseLayout>
);
