# Specification

## Summary
**Goal:** Configure a shared Remove.bg API key in the backend that all users can access automatically, eliminating the need for users to provide their own API key.

**Planned changes:**
- Add Remove.bg API key 'scfjBzfHc4MnzCCajQdAxZp6' as an environment variable in the backend
- Create a backend query method to expose the shared API key to frontend clients
- Remove the API key input field from the BackgroundRemover component UI
- Remove local storage API key functionality from the frontend
- Update useBackgroundRemoval hook to fetch the shared API key from the backend before making Remove.bg API calls

**User-visible outcome:** Users can remove backgrounds from photos immediately without needing to enter their own Remove.bg API key. The background removal feature works automatically for all users using the shared backend API key.
