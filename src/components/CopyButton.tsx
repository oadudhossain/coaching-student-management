"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "লিংক কপি",
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          window.prompt("লিংকটি কপি করুন:", text);
        }
      }}
    >
      {done ? "কপি হয়েছে ✓" : label}
    </button>
  );
}
