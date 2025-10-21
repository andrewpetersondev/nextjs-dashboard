import type { FC } from "react";
import type { UserRole } from "@/features/auth/lib/auth.roles";
import { demoUserAction } from "@/server/auth/application/actions/demo-user.action";
import { Button } from "@/ui/atoms/button";

interface DemoFormProps {
  label: string;
  text: string;
  userRole: UserRole;
}

export const DemoForm: FC<DemoFormProps> = ({
  text,
  userRole,
  label,
}: DemoFormProps) => (
  <form
    action={async (): Promise<void> => {
      "use server";
      await demoUserAction(userRole);
    }}
    aria-label={label}
  >
    <Button
      className="mt-2 flex w-full items-center justify-center gap-3 rounded-md bg-bg-primary px-3 py-2 font-semibold text-sm text-text-primary ring-1 ring-bg-accent hover:bg-bg-accent focus-visible:ring-2 focus-visible:ring-bg-focus"
      data-cy={`demo-user-button-${label}`}
      type="submit"
    >
      {text}
    </Button>
  </form>
);
