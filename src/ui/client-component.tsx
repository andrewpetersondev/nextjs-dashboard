'use client'

import { useState } from "react";

export default function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 text-center">
      <h3 className="text-xl font-semibold mb-4">Counter Component</h3>
      <p className="mb-4">Current count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Increment
      </button>
    </div>
  );
}
