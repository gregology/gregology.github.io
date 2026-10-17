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
3. Checks that every link in `_site/llms.txt` resolves to a file under `_site`, failing the build if any don't.
4. Deploys the generated `_site` folder with the official `actions/deploy-pages@v4`.

Make sure the repository Settings → Pages “Build and deployment” source is set to GitHub Actions so the workflow can publish updates.

## Markdown twins and llms.txt
`_plugins/markdown_page_generator.rb` writes a `.md` twin of every post and of every page linked internally from `navbar-links` in `_config.yml`. To twin a page that isn't in the nav, add `markdown_twin: true` to its front matter. The generator is the only place that decides twin URLs: it exposes them as `markdown_url` on the source page or post, and `llms.txt` links to those. `llms-full.txt` has no template; the plugin builds it from the rendered twins after the site renders.

## Includes
[_includes](https://github.com/gregology/gregology.github.io/tree/master/_includes) contains tools for instagram, youtube, flickr, and generic video players. I have tried to make them as generic as possible with usage examples so they can be used elsewhere. I'm working on my javascript / jekyll skills so please let me know of any improvements.

## License
The jekyll theme, HTML, CSS and JavaScript is licensed under GPLv3 (unless stated otherwise in the file).
