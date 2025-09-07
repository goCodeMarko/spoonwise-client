import { AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordGroupRequiredValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get("password")?.value;
  const confirmPassword = control.get("confirmPassword")?.value;

  // If both are empty → group error
  if (!password && !confirmPassword) {
    return { groupRequired: true };
  }

  return null;
}
