import * as React from 'react';
import classNames from 'classnames';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import FormGroup from './FormGroup';
import FormDropdown from './FormDropdown';
import useComposedRefs from '../../../hooks/useComposedRefs';

type HTMLFormProps = React.ComponentPropsWithoutRef<'form'>;
type Props = Omit<HTMLFormProps, 'onSubmit'> & {
  onSubmit?: (
    values: Map<string, string>,
    files: Map<string, File>,
    event: React.FormEvent<HTMLFormElement>,
  ) => void;
};

function BaseForm(
  { children, className, onSubmit, ...htmlFormProps }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const combinedRefs = useComposedRefs(formRef, forwardedRef);

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formElt = formRef.current;
    if (onSubmit && formElt) {
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

  const formClassName = classNames('space-y-4', className);

  return (
    <form
      ref={combinedRefs}
      className={formClassName}
      onSubmit={onFormSubmit}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...htmlFormProps}
    >
      {children}
    </form>
  );
}

const Form = React.forwardRef<HTMLFormElement, Props>(
  BaseForm,
) as React.ForwardRefExoticComponent<
  Props & React.RefAttributes<HTMLFormElement>
> & {
  Dropdown: typeof FormDropdown;
  Group: typeof FormGroup;
  Input: typeof FormInput;
  SubmitButton: typeof FormSubmitButton;
};

Form.Dropdown = FormDropdown;
Form.Group = FormGroup;
Form.Input = FormInput;
Form.SubmitButton = FormSubmitButton;

export default Form;
