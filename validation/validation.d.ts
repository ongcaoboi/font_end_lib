declare function Validation(options: {
  errorSelector?: string;
  classError?: string;
  formGroupSelector?: string;
  form?: string;
  rules: Array<Rule>,
  onSubmit?: (data: any) => void;
}): void;

export = Validation;

declare interface Rule {
  selector: string;
  type: string;
  regex: RegExp;
  test: (value: any) => string | undefined;
  message: string;
}