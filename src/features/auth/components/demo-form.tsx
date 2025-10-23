"use client";

import type { FC } from "react";
import { useActionState } from "react";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import type { FormResult } from "@/shared/forms/core/types";
import { Button } from "@/ui/atoms/button";

interface DemoFormProps {
  label: string;
  text: string;
  userRole: UserRole;
  action: (role: UserRole) => Promise<FormResult<never, unknown>>;
}

export const DemoForm: FC<DemoFormProps> = ({
  text,
  userRole,
  label,
  action,
}: DemoFormProps) => {
  const [, boundAction, pending] = useActionState<
    FormResult<never, unknown>,
    FormData
  >(async () => action(userRole), {
    error: {
      code: "BAD_REQUEST",
      fieldErrors: {},
      kind: "validation",
      message: "",
    },
    ok: false,
  });

  return (
    <form action={boundAction} aria-label={label}>
      <Button
        className="mt-2 flex w-full items-center justify-center gap-3 rounded-md bg-bg-primary px-3 py-2 font-semibold text-sm text-text-primary ring-1 ring-bg-accent hover:bg-bg-accent focus-visible:ring-2 focus-visible:ring-bg-focus"
        data-cy={`demo-user-button-${label}`}
        disabled={pending}
        type="submit"
      >
        {text}
      </Button>
    </form>
  );
};
