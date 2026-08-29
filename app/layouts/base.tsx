import { FunctionComponent } from "preact";

export type BaseLayoutProps = { title: string };

export const BaseLayout: FunctionComponent<BaseLayoutProps> = (
  { title, children },
) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{title} - Freelance Teacher</title>

      <link rel="stylesheet" href="/static/main.css" />
    </head>
    <body>{children}</body>
  </html>
);
