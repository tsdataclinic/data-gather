export enum EnvVar {
  AirtableConfigJSON = 'REACT_APP_AIRTABLE_CONFIG_JSON',
}
/**
 * Safely get an environment variable from process.env.
 * If no `defaultVal` is given then we throw an error.
 *
 * Only environment variables defined in the `EnvVar` enum are valid.
 *
 * @param {EnvVar} envVar - The environment variable to get.
 * @returns {string} The environment variable value.
 * @throws Error if no `defaultVal` is provided and `envVar` does not exist.
 */
function getEnvConfig(envVar: EnvVar, defaultVal: string | undefined): string;
function getEnvConfig(envVar: EnvVar): string;
function getEnvConfig(envVar: EnvVar, defaultVal?: string): string {
  // need to specifically check arg length because a default value of
  // undefined is valid
  if (arguments.length === 1 && !(envVar in process.env)) {
    throw new Error(`Environment variable '${envVar}' could not be found.`);
  }

  return process.env[envVar] ?? defaultVal ?? '';
}

export default getEnvConfig;
