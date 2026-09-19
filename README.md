# dsh-font

A Nerd Font for the whole DeepSeek Harness web GUI — UI **and** code/terminal —
applied through DSH's own font hooks so it stays independent of whichever theme
is active.

Written for the case DSH does not cover: `ui-theme`'s built-in settings expose
only `preference` (light / dark / system) and `fontSize` (12–17px). There is no
font-family control anywhere in the GUI, so the only way to change the font is to
override the two CSS custom properties DSH already reads:

| Variable | Consumed by | This plugin sets it to |
|---|---|---|
| `--dsw-font-family` | `body { font-family: var(--dsw-font-family, …) }` and every `--dsw-font-markdown-*` derivative | `"Hack Nerd Font Mono", "PingFang SC", "Hiragino Sans GB", "Apple Color Emoji", Helvetica, Arial, sans-serif` |
| `--ds-font-family-code` | code blocks, tool output, terminals | `"Hack Nerd Font Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` |

## Why a plugin and not a theme

Both variables are defined by `ui-theme`'s base stylesheet on `:root`, and a
DSH theme only overrides `--dsw-alias-*` colours. Setting the font in a separate
always-on plugin means:

- it applies to **every** theme (including the built-in light/dark ones);
- it survives theme switching and plugin HMR;
- turning a skin off does not take the font with it.

## How it applies

`lib/client.js` is a browser-half client plugin (the host half is a no-op loader
entry — the same dual-face shape as `dsh-skin` and the shipped `ui-*` packages).
On activation it:

1. writes both variables to `document.documentElement` and to `<body>`;
2. gives the `<body>` value `important` priority, because a theme's inline custom
   properties would otherwise win over `:root` inheritance;
3. watches `<body>`'s inline `style` attribute and re-asserts whenever the
   platform rewrites it (theme switch, boot script, HMR);
4. re-asserts a few times across the boot window (60 / 240 / 800 / 2000 ms).

Every write is guarded by a "value actually differs" check, so the observer
cannot re-trigger itself into a loop.

## Install

```bash
# 1. install the package into the web profile — this also appends its package
#    name to the profile's dsh.profile.bundles, because the package declares
#    dsh.bundle.patch (no manual package.json edit needed).
dsh plugin --profile web add "file:/absolute/path/to/dsh-font"

# 2. restart the web profile: new bundle entries are composed at boot.
#    Ctrl-C the running `dsh web`, run it again, then refresh the page.
```

The font itself must already be installed on the machine. On macOS the Nerd
Fonts live in `~/Library/Fonts`; the family names this plugin expects are
`Hack Nerd Font Mono` (used here) and, if you prefer a proportional UI face,
`Hack Nerd Font Propo`.

## Configure

Edit the two constants at the top of `lib/client.js`:

```js
const UI_STACK   = "\"Hack Nerd Font Mono\", \"PingFang SC\", …";
const CODE_STACK = "\"Hack Nerd Font Mono\", \"SF Mono\", Menlo, …";
```

Keep at least one CJK fallback (`PingFang SC` / `Hiragino Sans GB`) and an emoji
fallback after the Nerd Font: Nerd Fonts carry icon glyphs, not CJK or colour
emoji. Because the profile installs a `file:` dependency as a **copy**, an edit
here needs re-syncing before it is served:

```bash
cp lib/client.js /Users/<you>/.dsh/profiles/web/node_modules/dsh-font/lib/
# then reload the plugin (restart dsh web, or toggle the entry via the
# profile's cordis.patch.yml) and refresh the page
```

## Verify

With the page open, in the browser console:

```js
getComputedStyle(document.body).getPropertyValue("--dsw-font-family");
getComputedStyle(document.body).getPropertyValue("--ds-font-family-code");
```

Both should return the stacks above. `Settings → Plugins` lists the loader entry
as `dsh-font`; the plugin registers no UI of its own.

## Trade-offs

- The UI stack is **monospace**, which is what "Nerd Font everywhere" means:
  proportional UI text (and CJK metrics) can look wider than the macOS default
  (`SF Pro` + `PingFang SC`). For the usual terminal-flavoured UI with a normal
  body face, set `UI_STACK` to a proportional Nerd Font such as
  `Hack Nerd Font Propo` or `JetBrainsMono NFP` and keep `CODE_STACK` monospace.
- Nothing is persisted by the Host: the stacks are constants, applied on every
  boot. There is no per-session or per-theme state to keep in sync.

## Uninstall

Remove the `dsh-font` entry from the profile's `dependencies` **and**
`dsh.profile.bundles` (both live in `~/.dsh/profiles/web/package.json`), then
delete the package directory and restart `dsh web`.

## Tested against

`@deepseek-ai/dsh` 0.1.5-rc.2 (web profile), macOS, Chrome. No build step and no
runtime dependencies: the package ships two hand-written files.

## License

MIT — see `LICENSE`.
