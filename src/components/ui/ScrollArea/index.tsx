import * as React from 'react';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';

type Props = RadixScrollArea.ScrollAreaProps;

export default function ScrollArea(props: Props): JSX.Element {
  const { children, ...rootProps } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RadixScrollArea.Root {...rootProps}>
      <RadixScrollArea.Viewport>{children}</RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar orientation="vertical">
        <RadixScrollArea.Thumb />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Scrollbar orientation="horizontal">
        <RadixScrollArea.Thumb />
      </RadixScrollArea.Scrollbar>
    </RadixScrollArea.Root>
  );
}
