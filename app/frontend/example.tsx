/// <reference lib="dom" />

import { createRoot } from "react-dom/client";

import { hello } from "@/app/shared/constants.ts";

export const Hello = () => <h1>{hello}</h1>;

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<Hello />);
}
