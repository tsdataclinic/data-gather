/**
 * Dummy implementation of a question with a string-valued ID
 */
class StringIdQuestion {
  constructor(private id: string) {}

  getId(): string {
    return this.id;
  }
}

export default StringIdQuestion;
