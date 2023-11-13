import { z } from 'zod';
import {
  SerializedAirtableBase,
  SerializedAirtableConfig,
  SerializedAirtableField,
  SerializedAirtableTable,
} from '../../api';

export type AirtableField = SerializedAirtableField;
export type AirtableTable = SerializedAirtableTable;
export type AirtableBase = SerializedAirtableBase;
export type AirtableConfig = SerializedAirtableConfig;

export const AirtableFieldOptionsSchemas = {
  SingleSelect: z.object({
    choices: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
      }),
    ),
  }),
};

export function getSingleSelectFieldOptions(
  airtableField?: AirtableField,
): z.infer<typeof AirtableFieldOptionsSchemas['SingleSelect']> | undefined {
  const parsedFieldOptions = AirtableFieldOptionsSchemas.SingleSelect.safeParse(
    airtableField?.options,
  );
  return parsedFieldOptions.success ? parsedFieldOptions.data : undefined;
}
