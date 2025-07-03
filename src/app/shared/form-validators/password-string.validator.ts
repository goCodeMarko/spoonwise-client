import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;

    if (!password) return null;

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\\[\]=+;'/`~]/.test(
      password
    );

    const valid = hasUppercase && hasNumber && isLongEnough && hasSpecialChar;

    return valid
      ? null
      : {
          passwordStrength: {
            hasUppercase,
            hasNumber,
            hasSpecialChar,
            isLongEnough,
          },
        };
  };
}
