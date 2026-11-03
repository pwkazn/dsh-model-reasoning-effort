/**
 * `dsh-model-reasoning-effort` host half.
 *
 * The plugin owns no host state: it edits the official `llm-pi-ai` settings
 * section through the ordinary settings Remote, exactly as the Models page's
 * own editor does. This entry exists because the client module graph is
 * composed from enabled Loader entries — the browser half is discovered
 * through the package's `dsh.client` declaration.
 *
 * @module dsh-model-reasoning-effort
 */

/** Plugin name shown by the Loader. */
export const name = 'dsh-model-reasoning-effort'

/**
 * Mount the plugin.
 *
 * There is nothing to register on the Host: the client half is the whole
 * feature. Keeping the function explicitly empty documents that absence
 * instead of leaving a reader to wonder whether a side effect went missing.
 */
export function apply() {}
