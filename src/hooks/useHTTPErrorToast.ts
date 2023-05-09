import * as React from 'react';
import { ApiError } from '../api';
import { useToast } from '../components/ui/Toast';

const DEFAULT_FALLBACK_MESSAGE = 'An unexpected error occurred.';

type ErrorToastOptions = {
  /**
   * The error we are raising a toast for.
   * The default toast text is different depending on the error type.
   * For example, if we detect an `ApiError` type then we use `error.message`
   * as the title and `error.body.detail` as the full message.
   * However, if the error is just a generic `Error` instance then we use
   * `error.message` as the text instead.
   */
  error: unknown;

  /**
   * Use this if no error message could be found in the `error` object, so
   * we want to have a fallback message. By default the fallback message
   * will be 'An unexpected error occurred.'
   */
  fallbackMessage?: string;

  /**
   * Errors have messages attached to them, but if we want to raise our own
   * message then override it with this. This will also override the
   * `fallbackMessage`
   */
  overrideMessage?: string;
};

function objectHasDetailString(obj: unknown): obj is { detail: string } {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'detail' in obj &&
    typeof obj.detail === 'string'
  );
}

/**
 * This function raises a toast error for the given `error` that is passed into
 * the `options` object.
 *
 * This function also returns tuple of `errorTitle` and `errorMessage` so in case
 * the user of this function wants to use these extracted values for anything.
 */
export default function useHTTPErrorToast(): (options: ErrorToastOptions) => {
  errorMessage: string;
  errorTitle: string;
} {
  const toaster = useToast();

  const raiseToastError = React.useCallback(
    (options: ErrorToastOptions) => {
      const { error, overrideMessage, fallbackMessage } = options;
      const fallbackString = fallbackMessage ?? DEFAULT_FALLBACK_MESSAGE;
      let errorTitle = 'Error';
      let errorMessage = overrideMessage ?? fallbackString;

      if (error instanceof Error) {
        if (
          error instanceof ApiError &&
          objectHasDetailString(error.body) &&
          error.body.detail !== ''
        ) {
          errorTitle = `Error: ${error.message}`;
          errorMessage = overrideMessage ?? error.body.detail;
        } else {
          errorMessage = overrideMessage ?? (error.message || fallbackString);
        }
      }

      toaster.notifyError(errorTitle, errorMessage);
      return { errorTitle, errorMessage };
    },
    [toaster],
  );

  return raiseToastError;
}
