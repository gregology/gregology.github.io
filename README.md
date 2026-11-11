# Gregology

A simple Jekyll blog for [Gregology.net](https://gregology.net).

## Theme
Base theme [beautiful-jekyll](https://github.com/daattali/beautiful-jekyll) created by [@daattali](https://github.com/daattali).

## Local development
Install the Ruby dependencies locally and run the built-in Jekyll server:

```bash
bundle install
bundle exec jekyll serve
```

## Deployment
Publishing is handled by GitHub Actions in `.github/workflows/pages.yml`. Pushing to `master` triggers a workflow that:

1. Installs Ruby and the gems defined in `Gemfile.lock`.
2. Builds the site with `bundle exec jekyll build`.
3. Deploys the generated `_site` folder with the official `actions/deploy-pages@v4`.

Make sure the repository Settings → Pages “Build and deployment” source is set to GitHub Actions so the workflow can publish updates.

## Includes
[_includes](https://github.com/gregology/gregology.github.io/tree/master/_includes) contains tools for instagram, youtube, flickr, and generic video players. I have tried to make them as generic as possible with usage examples so they can be used elsewhere. I'm working on my javascript / jekyll skills so please let me know of any improvements.

## Office Assistant
Add `clippy_help` to a page's front matter and the Office Assistant pops up with that message once the page has finished loading. Add `clippy_choices` to ask a question with clickable answers; each answer can have a `reply`, an `animation` and a `url`:

```yaml
clippy_help: It looks like you're trying to use the Internet but got lost
clippy_choices:
  - label: Get help with using the Internet
    reply: "Step 1: turn it off. Step 2: turn it back on."
    animation: GetTechy
  - label: Just use the Internet without help
```

A page can script the assistant by defining `window.clippyReady = function (agent) { ... }` (see `reference/gazillion.md`). Visitors can click it to search, right-click (or long-press) for Hide / Options / Choose Assistant / Animate!, and pick Clippit, Links, Rocky, F1 or The Genius. The code lives in `js/clippy.js` and `js/office-assistant.js`; the characters in `agents/` are built with `_tools/clippy/build_agents.py`.

## License
The jekyll theme, HTML, CSS and JavaScript is licensed under GPLv3 (unless stated otherwise in the file).
