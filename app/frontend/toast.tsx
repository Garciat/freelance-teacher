/// <reference lib="dom" />

import { consumeToast } from "@/lib/web/toast/frontend.ts";

const element = document.getElementById("toast");

const toast = await consumeToast();

if (toast && element) {
  element.textContent = toast;
  element.showPopover();

  setTimeout(() => {
    element.hidePopover();
  }, 3000);
}
