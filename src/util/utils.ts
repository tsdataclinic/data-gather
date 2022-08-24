import * as InterviewScreenEntry from '../models/InterviewScreenEntry';

export class Utils {
  public static getEntryById(
    entryId: string,
    entries: InterviewScreenEntry.T[] | null,
  ): InterviewScreenEntry.T | null {
    if (entries === null) return null;

    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      if (entry.id === entryId) return entry;
    }
    return null;
  }
}
