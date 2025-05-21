"use client";

import { useState } from "react";

export default function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 text-center">
      <h3 className="mb-4 text-xl font-semibold">Counter Component</h3>
      <p className="mb-4">Current count: {count}</p>
      <button
        type="button"
        onClick={() => setCount(count + 1)}
        className="rounded bg-bg-accent px-4 py-2 text-text-accent transition-colors hover:bg-bg-hover hover:text-text-hover"
      >
        Increment
      </button>
    </div>
  );
}
