import * as React from 'react';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import FormGroup from './FormGroup';
import FormDropdown from './FormDropdown';

type HTMLFormProps = React.ComponentPropsWithoutRef<'form'>;
type Props = Omit<HTMLFormProps, 'onSubmit'> & {
  onSubmit: (
    values: Map<string, string>,
    files: Map<string, File>,
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
};

export default function Form({
  children,
  className,
  onSubmit,
  ...htmlFormProps
}: Props): JSX.Element {
  const ref = React.useRef<HTMLFormElement | null>(null);

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formElt = ref.current;
    if (formElt) {
      const formData = new FormData(formElt);
      const valuesMap = new Map<string, string>();
      const filesMap = new Map<string, File>();
      formData.forEach((value: FormDataEntryValue, key: string) => {
        if (typeof value === 'string') {
          valuesMap.set(key, value);
        } else if (value instanceof File) {
          filesMap.set(key, value);
        }
      });
      onSubmit(valuesMap, filesMap, event);
    }
  };

  return (
    <form
      ref={ref}
      className={className ?? 'space-y-4'}
      onSubmit={onFormSubmit}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...htmlFormProps}
    >
      {children}
    </form>
  );
}

Form.Dropdown = FormDropdown;
Form.Input = FormInput;
Form.SubmitButton = FormSubmitButton;
Form.Group = FormGroup;
