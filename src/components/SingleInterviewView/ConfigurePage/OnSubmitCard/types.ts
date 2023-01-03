import assertUnreachable from '../../../../util/assertUnreachable';

// TODO: remove these types once a real OnSubmitAction schema is created
export enum OnSubmitActionType {
  EDIT_ROW = 'edit_row',
  INSERT_ROW = 'insert_row',
}

export type EntryId = string;

// TODO: these should exist in the main Interview type instead. They are being
// held here for now until we have an official schema defined.
export type EditRowAction = {
  columnMappings: ReadonlyMap<string, EntryId | undefined>;
  id: string;
  rowTarget?: EntryId;
  type: OnSubmitActionType.EDIT_ROW;
};

export type InsertRowAction = {
  columnMappings: ReadonlyMap<string, EntryId | undefined>;
  id: string;
  tableTarget?: string;
  type: OnSubmitActionType.INSERT_ROW;
};

export type OnSubmitAction = EditRowAction | InsertRowAction;

/**
 * An array of all OnSubmitActionTypes. Useful for populating a list of
 * action types, e.g. for a dropdown.
 */
export const ON_SUBMIT_ACTION_TYPES: readonly OnSubmitActionType[] =
  Object.values(OnSubmitActionType);

export function actionTypeToDisplayName(
  actionType: OnSubmitActionType,
): string {
  switch (actionType) {
    case OnSubmitActionType.EDIT_ROW:
      return 'Edit Row';
    case OnSubmitActionType.INSERT_ROW:
      return 'Insert Row';
    default:
      return assertUnreachable(actionType);
  }
}
