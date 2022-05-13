/**
 * Assert that a variable never has a type. This is ideal for asserting
 * unreachable code paths, such as checking that an `if` or `switch` statement
 * is exhaustive. Example usage:
 *
 * function (type: 'A' | 'B') {
 *   switch (type) {
 *     case 'A':
 *       return;
 *     case 'B':
 *       return;
 *     default:
 *       // this will validate we've checked all possible values of `type`
 *       return assertUnreachable(type);
 *   }
 * }
 *
 * @param {never} x - The variable to test for type emptiness.
 * @param {object} options - Optional config.
 *    - throwError {boolean}: defaults to `true`. Set to `false` if we shouldn't
 *    throw a runtime error.
 * @returns {void} Nothing
 * @throws Error if `options.throwError` is `true` and `x` is not of type `never`.
 */
function assertUnreachable(x: never, options: { throwError: true }): never;
function assertUnreachable(x: never, options: { throwError: false }): void;
function assertUnreachable(x: never): never;
function assertUnreachable(x: never, options?: { throwError: boolean }): void {
  if (!options || (options && options.throwError)) {
    if (typeof x === 'string') {
      throw new Error(`This should have been unreachable. Received '${x}'`);
    }
    throw new Error('This should have been unreachable.');
  }
}

export default assertUnreachable;
