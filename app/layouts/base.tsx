export type BaseLayoutProps = { title: string; children: React.ReactNode };

export const BaseLayout: React.FC<BaseLayoutProps> = (
  { title, children },
) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{title} - Freelance Teacher</title>

      <link rel="stylesheet" href="/static/main.css" />
    </head>
    <body>{children}</body>
  </html>
);
