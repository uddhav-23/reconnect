/**
 * Optional Algolia integration for large-scale alumni search.
 *
 * 1. Add `algoliasearch` and sync user profiles via Cloud Function or scheduled job.
 * 2. Set `VITE_ALGOLIA_APP_ID` and `VITE_ALGOLIA_SEARCH_KEY` in the environment.
 * 3. Replace client-side filtering in `Alumni.tsx` with index search when keys are present.
 */
export function isAlgoliaConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_ALGOLIA_APP_ID && import.meta.env.VITE_ALGOLIA_SEARCH_KEY
  );
}
