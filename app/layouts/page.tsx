import { BaseLayout, BaseLayoutProps } from "@/app/layouts/base.tsx";

export type PageLayoutProps = BaseLayoutProps;

const nav = [
  { label: "Home", href: "/" },
  { label: "Students", href: "/students/" },
  { label: "Invoices", href: "/invoices/" },
];

export const PageLayout: React.FC<PageLayoutProps> = (
  { title, children },
) => (
  <BaseLayout title={title}>
    <main>
      <header className="site-navigation">
        <h1>Freelance Teacher</h1>
        <nav>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="content">
        <h2>{title}</h2>
        {children}
      </div>
    </main>
  </BaseLayout>
);
