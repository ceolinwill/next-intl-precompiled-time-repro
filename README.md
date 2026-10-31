# next-intl precompiled `{value, time}` Reproduction

Minimal reproduction for `{value, time}` rendering a date when `experimental.messages.precompile` is on. `{value, time}`, `{value, time, short}` and `{value, time, medium}` all render `9/27/2026` instead of the time. The built-in `short` and `medium` date styles stop applying too. Turning `precompile` off renders all of them as expected. Nothing warns, in development or production.

## Reproduction

```sh
npm install
npm run repro
```

`npm run repro` runs `next build`, then `scripts/check.mjs` reads the prerendered `.next/server/app/index.html`. `src/app/page.tsx` renders each message in `messages/en.json` with `value = new Date("2026-09-27T14:30:00Z")`, locale `en` and time zone `UTC`. The script compares the output with what the same messages render without `precompile`, and exits with code 1:

```txt
FAIL {value, time}          -> "9/27/2026"    expected "2:30:00 PM"
FAIL {value, time, short}   -> "9/27/2026"    expected "2:30 PM"
FAIL {value, time, medium}  -> "9/27/2026"    expected "2:30:00 PM"
ok   {value, date}          -> "9/27/2026"    expected "9/27/2026"
FAIL {value, date, short}   -> "9/27/2026"    expected "9/27/26"
FAIL {value, date, medium}  -> "9/27/2026"    expected "Sep 27, 2026"

5 of 6 messages rendered differently.
```

With `precompile` off (`next.config.ts` reads `PRECOMPILE`), every message matches:

```sh
PRECOMPILE=0 npm run repro
```

```txt
ok   {value, time}          -> "2:30:00 PM"   expected "2:30:00 PM"
ok   {value, time, short}   -> "2:30 PM"      expected "2:30 PM"
ok   {value, time, medium}  -> "2:30:00 PM"   expected "2:30:00 PM"
ok   {value, date}          -> "9/27/2026"    expected "9/27/2026"
ok   {value, date, short}   -> "9/27/26"      expected "9/27/26"
ok   {value, date, medium}  -> "Sep 27, 2026" expected "Sep 27, 2026"
```

## Expected Behavior

A `time` argument renders a time, and the built-in `short`, `medium`, `long` and `full` styles render the same with and without `precompile`.

## Actual Behavior

Without `precompile`, use-intl passes intl-messageformat's default `date` and `time` formats ([`convertFormatsToIntlMessageFormat.tsx`](https://github.com/amannn/next-intl/blob/b9fc98a814957b9c97894c7b57151215ac39afa6/packages/use-intl/src/core/convertFormatsToIntlMessageFormat.tsx#L20-L40)). With `precompile`, [`format-only.tsx`](https://github.com/amannn/next-intl/blob/b9fc98a814957b9c97894c7b57151215ac39afa6/packages/use-intl/src/core/format-message/format-only.tsx#L15-L27) passes only the app's own `dateTime` formats to `icu-minify/format`.

In [`icu-minify/src/format.tsx`](https://github.com/amannn/next-intl/blob/b9fc98a814957b9c97894c7b57151215ac39afa6/packages/icu-minify/src/format.tsx#L330-L390), `formatDateTimeValue` uses the `date` or `time` type only for a development error message. A missing style (`{value, time}`) or an unknown named style (`short`) resolves to `undefined`, so it calls `new Intl.DateTimeFormat(locale, {timeZone})`, whose default output is a date. The `Missing time format "short"` check is development-only, and use-intl's published `format-only` build inlines icu-minify's production formatter (`dist/esm/development/format-message/format-only.js`), so it never fires.

## Environment

- next-intl: `4.14.9`
- use-intl: `4.14.9`
- icu-minify: `4.14.9`
- Next.js: `16.4.3` (Turbopack)
- React: `19.3.1`
- Node.js: `24.22.0`
- npm: `11.19.1`
- macOS: `27.2`
