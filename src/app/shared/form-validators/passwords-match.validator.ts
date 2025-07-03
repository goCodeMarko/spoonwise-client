import { FormGroup, ValidationErrors } from "@angular/forms";

export function passwordsMatchValidator(
  group: FormGroup
): ValidationErrors | null {
  const password = group.get("password")?.value;
  const confirmPassword = group.get("confirmPassword")?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}
