// In a server component

import { useTransition } from "react";
import {
  getRevenueAction,
  recalculateRevenueAction,
} from "@/features/revenues/revenue.actions";

async function RevenuePageComponent({ year }: { year?: number }) {
  const result = await getRevenueAction(db, { year });

  if (!result.success) {
    return <ErrorDisplay message={result.error} />;
  }

  return <RevenueChart data={result.data} />;
}

// In a client component with form
function RecalculateRevenueForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const year = Number(formData.get("year"));
      const result = await recalculateRevenueAction(db, { year });

      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Revenue recalculated successfully");
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="year" required type="number" />
      <button disabled={isPending}>
        {isPending ? "Recalculating..." : "Recalculate"}
      </button>
    </form>
  );
}
