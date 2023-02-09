// TODO: replace confirm with custom component
export default function unsavedChangesConfirm(
  unsavedChanges: boolean,
): boolean {
  if (unsavedChanges) {
    return window.confirm(
      'You have unsaved changes, are you sure you want to navigate away form this page?',
    );
  }
  return true;
}
