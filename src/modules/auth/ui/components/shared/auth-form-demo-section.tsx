import type { FC, JSX } from "react";
import {
  ADMIN_ROLE,
  USER_ROLE,
  type UserRole,
} from "@/modules/auth/domain/schema/auth.roles";
import {
  DEMO_ADMIN_LABEL,
  DEMO_USER_LABEL,
} from "@/modules/auth/ui/auth.tokens";
import { DemoForm } from "@/modules/auth/ui/components/forms/demo-form";
import type { FormResult } from "@/shared/forms/types/form-result.types";

interface AuthFormDemoSectionProps {
  readonly demoAdminText: string;
  readonly demoUserAction: (
    _prevState: FormResult<never>,
    formData: FormData,
  ) => Promise<FormResult<never>>;
  readonly demoUserText: string;
}

/**
 * AuthFormDemoSection
 * Section for authentication forms allowing login as demo users.
 */
export const AuthFormDemoSection: FC<AuthFormDemoSectionProps> = ({
  demoUserText,
  demoAdminText,
  demoUserAction,
}: AuthFormDemoSectionProps): JSX.Element => (
  <>
    <DemoForm
      action={demoUserAction}
      label={DEMO_USER_LABEL}
      text={demoUserText}
      userRole={USER_ROLE as UserRole}
    />
    <DemoForm
      action={demoUserAction}
      label={DEMO_ADMIN_LABEL}
      text={demoAdminText}
      userRole={ADMIN_ROLE as UserRole}
    />
  </>
);
