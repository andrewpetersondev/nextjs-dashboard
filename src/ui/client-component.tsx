"use client";

import { useState } from "react";

export default function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 text-center">
      <h3 className="mb-4 text-xl font-semibold">Counter Component</h3>
      <p className="mb-4">Current count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
      >
        Increment
      </button>
    </div>
  );
}
