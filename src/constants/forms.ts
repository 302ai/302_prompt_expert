import { FormGeneratorType } from "@/components/common/form-generator";
import { SignInFormType } from "@/components/forms/auth/schema";

export const SIGN_IN_FORM: FormGeneratorType<SignInFormType>[] = [
  {
    id: "code",
    name: "code",
    inputType: "input",
    type: "password" as HTMLInputElement["type"],
    placeholder: "auth.form.input_code",
    label: "",
    autoComplete: "new-password",
  },
  {
    id: "remember",
    name: "remember",
    inputType: "checkbox",
    label: "auth.form.remember_code",
    placeholder: "auth.form.remember_code",
  },
];

type FormConstantsProps = {
  signInForm: FormGeneratorType<SignInFormType>[];
};

export const FORM_CONSTANTS: FormConstantsProps = {
  signInForm: SIGN_IN_FORM,
};
