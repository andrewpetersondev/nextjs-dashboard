import type { FC, JSX } from "react";
import { DemoForm } from "@/modules/auth/presentation/authn/components/forms/demo-form";
import {
  DEMO_ADMIN_LABEL,
  DEMO_USER_LABEL,
} from "@/modules/auth/presentation/constants/auth.tokens";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";

interface AuthFormDemoSectionProps {
  readonly demoAdminAction: (
    _prevState: FormResult<never>,
    formData: FormData,
  ) => Promise<FormResult<never>>;
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
  demoAdminAction,
}: AuthFormDemoSectionProps): JSX.Element => (
  <>
    <DemoForm
      action={demoUserAction}
      label={DEMO_USER_LABEL}
      text={demoUserText}
    />
    <DemoForm
      action={demoAdminAction}
      label={DEMO_ADMIN_LABEL}
      text={demoAdminText}
    />
  </>
);
