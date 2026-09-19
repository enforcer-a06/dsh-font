// dsh-font — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/dsh-font/client.js and executed
// through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body needs no shell module: the
// whole feature is two CSS custom properties that DSH's own ui-theme base.css
// defines on :root —
//
//   --dsw-font-family     the proportional UI stack (body { font-family: var(...) })
//   --ds-font-family-code the code/terminal stack
//
// Setting them here (instead of inside a theme) is deliberate: DSH's built-in
// ThemeSettings expose only `preference` and `fontSize`, so the font can only be
// changed through these hooks, and a theme only overrides --dsw-alias-* colours.
// Keeping the font in a separate always-on plugin means it applies to every
// theme, survives theme switching, and turning the Miku skin off does not take
// the font with it.
//
// <body> carries the value with `important` priority and is re-asserted
// whenever the platform rewrites <body>'s inline style (theme switches, HMR,
// the boot script), because a theme's inline custom properties would otherwise
// win over :root inheritance.
window.__ModuleLoader__.load({
	id: "dsh-font",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		/**
		 * UI stack. "Hack Nerd Font Mono" is installed at ~/Library/Fonts; it has
		 * no CJK or emoji coverage, so both fallbacks follow it.
		 */
		const UI_STACK = "\"Hack Nerd Font Mono\", \"PingFang SC\", \"Hiragino Sans GB\", \"Apple Color Emoji\", Helvetica, Arial, sans-serif";

		/** Code / tool-output / terminal stack. */
		const CODE_STACK = "\"Hack Nerd Font Mono\", \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace";

		/** The two shell font hooks, written to :root and to <body>. */
		const TOKENS = {
			"--dsw-font-family": UI_STACK,
			"--ds-font-family-code": CODE_STACK
		};

		/** Write both hooks where they differ, <body> with important priority. */
		function paint() {
			const root = document.documentElement;
			const body = document.body;
			for (const name of Object.keys(TOKENS)) {
				const value = TOKENS[name];
				if (root !== null && root.style.getPropertyValue(name) !== value) {
					root.style.setProperty(name, value);
				}
				if (body !== null && (body.style.getPropertyValue(name) !== value || body.style.getPropertyPriority(name) !== "important")) {
					body.style.setProperty(name, value, "important");
				}
			}
		}

		/**
		 * Re-assert on every rewrite of <body>'s inline style. paint() only writes
		 * when a value actually differs, so its own write cannot re-trigger the
		 * observer into a loop.
		 * @returns disposer detaching the observer.
		 */
		function watch() {
			paint();
			if (document.body === null) return () => {};
			const observer = new MutationObserver(paint);
			observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
			return () => observer.disconnect();
		}

		/**
		 * Start watching and re-assert a few times across the boot window, after
		 * the theme presenter and the boot script have had their say.
		 * @returns disposer stopping the observer and the timers.
		 */
		function boot() {
			const stop = watch();
			const timers = [60, 240, 800, 2000].map((ms) => window.setTimeout(paint, ms));
			return () => {
				stop();
				for (const timer of timers) window.clearTimeout(timer);
			};
		}

		/** Client plugin body: apply the font hooks and keep them applied. */
		function apply(ctx) {
			let dispose;
			const start = () => {
				dispose = boot();
			};
			if (document.body === null) document.addEventListener("DOMContentLoaded", start, { once: true });
			else start();
			if (ctx !== void 0 && typeof ctx.effect === "function") {
				ctx.effect(() => () => {
					if (dispose !== void 0) dispose();
				}, "dsh-font: shell font hooks");
			}
		}

		exports.UI_STACK = UI_STACK;
		exports.CODE_STACK = CODE_STACK;
		exports.apply = apply;
		return module.exports;
	}
});
