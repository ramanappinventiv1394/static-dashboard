# Fieldnotes Static Dashboard

A responsive, accessible team dashboard built with semantic HTML, CSS, and strict TypeScript without a UI framework. It fetches and validates public JSON at runtime, then renders a searchable team directory, task summaries, and open work.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Vite prints the local URL. To verify a production build, run `npm run build`; to serve that build locally, run `npm run preview`.

## Data

The dashboard uses the public [JSONPlaceholder](https://jsonplaceholder.typicode.com/) `/users` and `/todos` endpoints. Zod validates the response bodies before they enter the UI. The retry control re-fetches both resources if the network is unavailable.

## Accessibility and responsive behavior

The page uses landmark and heading structure, labelled search/filter controls, scoped table headers, visible focus states, live loading/error feedback, and a reduced-motion preference. The layout adapts at 1120px, 760px, and 480px. Check the deployed build with Lighthouse in Chrome DevTools; the assignment target is an accessibility score of 90 or higher.

## Training practice

- HTML semantics, metadata, form labels, and accessible tables
- CSS Grid, Flexbox, mobile-first breakpoints, variables, and reduced motion
- Typed fetch, `unknown` JSON payloads, Zod runtime validation, array transforms, DOM events, and `Intl.DateTimeFormat`
- `tsc --strict` through the production build command
