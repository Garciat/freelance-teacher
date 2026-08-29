export type BaseLayoutProps = { title: string; children: React.ReactNode };

export const BaseLayout: React.FC<BaseLayoutProps> = (
  { title, children },
) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{`${title} - Freelance Teacher`}</title>

      <link rel="stylesheet" href="/static/main.css" />

      <script type="importmap">
        {JSON.stringify({
          "imports": {
            "@/app/frontend/": "/frontend/",
            "@/app/shared/": "/shared/",
            "react/": "https://esm.sh/react@^19/",
            "react-dom/": "https://esm.sh/react-dom@^19/",
          },
        })}
      </script>
    </head>
    <body>{children}</body>
  </html>
);
