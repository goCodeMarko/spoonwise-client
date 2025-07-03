import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function allowedEmailDomainsValidator(
  allowedDomains: string[]
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email: string = control.value;
    if (!email) return null;

    const domain = email.substring(email.lastIndexOf("@") + 1).toLowerCase();
    const isValid = allowedDomains.some((d) => d.toLowerCase() === domain);

    return isValid ? null : { invalidDomain: true };
  };
}
