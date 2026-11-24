"use client";

export default function PrintButton() {
  return (
    <button type="button" className="btn print:hidden" onClick={() => window.print()}>
      প্রিন্ট করুন
    </button>
  );
}
