import React, { Children } from 'react';
import type { ReactNode, FormEvent } from 'react';
import FormInput, { isFormInput } from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import FormGroup, { isFormGroup } from './FormGroup';
import FormDropdown, { isFormDropdown } from './FormDropdown';

type Props = {
  children: ReactNode;
  className?: string;
  onSubmit: (
    values: Map<string, string>,
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

function flattenChildren(children: ReactNode): ReactNode[] {
  const flattenedChildren: ReactNode[] = [];

  Children.forEach(children, childNode => {
    if (isFormGroup(childNode)) {
      const groupChildren = flattenChildren(childNode.props.children);
      flattenedChildren.push(...groupChildren);
    } else {
      flattenedChildren.push(childNode);
    }
  });

  return flattenedChildren;
}

export default function Form({
  children,
  className,
  onSubmit,
}: Props): JSX.Element {
  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formElements = event.currentTarget.elements;
    const valuesMap = new Map<string, string>();

    const flattenedChildren = flattenChildren(children);
    Children.forEach(flattenedChildren, childNode => {
      if (isFormInput(childNode) || isFormDropdown<string>(childNode)) {
        const { name } = childNode.props;
        const elt = formElements.namedItem(name);
        if (
          elt instanceof HTMLInputElement ||
          elt instanceof HTMLSelectElement
        ) {
          valuesMap.set(name, elt.value);
        }
      }
      return undefined;
    });

    onSubmit(valuesMap, event);
  };

  return (
    <form className={className ?? 'space-y-4'} onSubmit={onFormSubmit}>
      {children}
    </form>
  );
}

Form.Dropdown = FormDropdown;
Form.Input = FormInput;
Form.SubmitButton = FormSubmitButton;
Form.Group = FormGroup;
