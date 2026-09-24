import { forwardRef } from "react";

import InputField, { type InputProps } from "@/components/admin/ui/InputField";

import { PHONE_ERROR_MESSAGE } from "@/lib/constants/common";
import { isValidPhone, sanitizePhoneValue } from "@/utils/utils";

export type PhoneFieldProps = Omit<InputProps, "type">;

/** Phone input: only digits reach the value, with a leading + for the country
 *  code. A value that is there but too short reports itself — pages that
 *  validate with a schema keep passing their own `error` and `hint`. */
const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
  ({ onChange, value, error, hint, ...rest }, ref) => {
    const typed = String(value ?? "");
    const isTooShort = typed.length > 0 && !isValidPhone(typed);

    return (
      <InputField
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(event) => {
          const allowed = sanitizePhoneValue(event.target.value);
          if (allowed !== event.target.value) event.target.value = allowed;
          onChange?.(event);
        }}
        error={isTooShort || error}
        hint={isTooShort ? PHONE_ERROR_MESSAGE : hint}
        {...rest}
      />
    );
  },
);

PhoneField.displayName = "PhoneField";

export default PhoneField;
