import * as React from 'react';
import ReactDOM from 'react-dom/client';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as RadixToast from '@radix-ui/react-toast';
import styled, { keyframes } from 'styled-components';

type ToastProps = {
  children: React.ReactNode;
  intent: 'success' | 'error';
  title: string;
};

const TOAST_TIME_MS = 3000;

const VIEWPORT_PADDING = 25;

const hide = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(calc(100% + ${VIEWPORT_PADDING}px));
  }
  to {
    transform: translateX(0);
  }
`;

const swipeOut = keyframes`
  from {
    transform: translateX(var(--radix-toast-swipe-end-x));
  }
  to {
    transform: translateX(calc(100% + ${VIEWPORT_PADDING}px));
  }
`;

const StyledViewport = styled(RadixToast.Viewport)`
  flex-direction: column;
  gap: 10px;
  padding: ${VIEWPORT_PADDING}px;
  position: fixed;
  margin: 0;
  max-width: 100vw;
  outline: none;
  right: 0;
  bottom: 0;
  width: 300px;
  z-index: 9999;
`;

const StyledToast = styled(RadixToast.Root)<{ intent: 'success' | 'error' }>`
  align-items: center;
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  overflow: hidden;
  padding: 12px;
  padding-left: 24px;
  position: relative;

  &:before {
    background-color: ${props =>
      props.intent === 'success' ? '#22c55e' : '#dc2626'};
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    width: 8px;
    top: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    &[data-state='open'] {
      animation: ${slideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    &[data-state='closed'] {
      animation: ${hide} 100ms ease-in;
    }
    &[data-swipe='move'] {
      transform: translateX(var(--radix-toast-swipe-move-x));
    }
    &[data-swipe='cancel'] {
      transform: translateX(0);
      transition: transform 200ms ease-out;
    }
    &[data-swipe='end'] {
      ${swipeOut} 100ms ease-out;
    }
  }
`;

const StyledTitle = styled(RadixToast.Title)`
  margin-bottom: 4px;
`;

const StyledDescription = styled(RadixToast.Description)`
  margin: 0;
`;

const StyledClose = styled(RadixToast.Close)`
  margin-right: 10px;
  margin-top: 2px;
  position: absolute;
  right: 0;
  top: 0;
`;

type ToastAPI = {
  notifyError: (title: string, description: React.ReactNode) => void;
  notifySuccess: (title: string, description: React.ReactNode) => void;
};

function Toast({ children, title, intent }: ToastProps): JSX.Element {
  return (
    <StyledToast duration={TOAST_TIME_MS} intent={intent}>
      <StyledTitle className="text-base font-semibold text-slate-800">
        {title}
      </StyledTitle>
      <StyledDescription asChild>
        <div className="text-sm text-slate-700">{children}</div>
      </StyledDescription>
      <StyledClose>
        <FontAwesomeIcon
          aria-label="Close"
          className="h-3 w-3 cursor-pointer text-slate-500 transition-colors hover:text-slate-700"
          icon={IconType.faX}
        />
      </StyledClose>
    </StyledToast>
  );
}

const ToastManagerContext = React.createContext<ToastAPI | undefined>(
  undefined,
);

/**
 * This behaves as a Toast manager. It renders the provider, the viewport,
 * and keeps track of all the toasts that are currently active.
 */
function ToastManagerComp(
  { children }: { children?: React.ReactNode },
  forwardedRef: React.ForwardedRef<ToastAPI>,
): JSX.Element {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const api = React.useMemo(
    () => ({
      notifySuccess: (title: string, content: React.ReactNode) => {
        setToasts(prevToasts =>
          prevToasts.concat({ title, children: content, intent: 'success' }),
        );
      },
      notifyError: (title: string, content: React.ReactNode) => {
        setToasts(prevToasts =>
          prevToasts.concat({ title, children: content, intent: 'error' }),
        );
      },
    }),
    [],
  );

  // We intentionally make the API available via a ref or via context in order
  // to support multiple ways of using the ToastManager
  React.useImperativeHandle(forwardedRef, () => api, [api]);

  // TODO: we should keep track of when a toast disappears and remove it
  // from the array. This is a memory leak - the array will keep growing.
  return (
    // setting a value of true just to make it super easy to detect that a
    // ToastManager has been instantiated
    <ToastManagerContext.Provider value={api}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((toastProps, idx) => (
          // Using index as array key is safe in this context
          // eslint-disable-next-line react/no-array-index-key,react/jsx-props-no-spreading
          <Toast key={idx} {...toastProps} />
        ))}
        <StyledViewport />
      </RadixToast.Provider>
    </ToastManagerContext.Provider>
  );
}

export const ToastManager = React.forwardRef(ToastManagerComp);

const noop = (): void => undefined;
const noopAPI: ToastAPI = {
  notifySuccess: noop,
  notifyError: noop,
};

/**
 * This is the function that should be used to trigger a toast. We do not
 * recommend using the <Toast> component directly.
 *
 * Triggering a toast message is as simple as:
 *     const toaster = useToast();
 *     toaster.notifySuccess('Success!', 'Descriptive text');
 */
export function useToast(): ToastAPI {
  const toasterRef = React.useRef<null | ToastAPI>(null);
  const toastAPIInContext = React.useContext(ToastManagerContext);

  React.useEffect(() => {
    const { body } = document;
    let container: HTMLDivElement | undefined;
    let rootNode: ReactDOM.Root | undefined;

    // we only need to insert a ToastManager to the DOM if we couldn't find one
    // already via context. If we found one in Context then it means that the
    // App already has a ToastManager instantiated whose API we can use.
    if (body && !toastAPIInContext) {
      container = document.createElement('div');
      body.appendChild(container);
      rootNode = ReactDOM.createRoot(container);
      rootNode.render(<ToastManager ref={toasterRef} />);
    }

    return () => {
      if (rootNode) {
        rootNode.unmount();
      }
      if (body && container) {
        body.removeChild(container);
      }
    };
  }, [toastAPIInContext]);

  const { current: toasterAPIFromRef } = toasterRef;
  return toastAPIInContext ?? toasterAPIFromRef ?? noopAPI;
}
