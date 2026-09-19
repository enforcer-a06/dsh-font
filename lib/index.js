/**
 * dsh-font — host half.
 *
 * Intentionally a no-op loader entry: the whole feature lives in the browser
 * half (`./client`), which DSH's dsh-client-modules picks up through the
 * package's `dsh.client` declaration — the same shape as dsh-skin and the
 * shipped ui-* packages. Nothing host-side needs to read or persist: the font
 * stack is a constant, and a visual preference the Host settings wire does not
 * expose is exactly what the browser half owns.
 */

/** Host loader entry for the browser implementation exported from `./client`. */
export function apply() {}
