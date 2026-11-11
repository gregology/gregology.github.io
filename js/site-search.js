// Site search for _includes/site-search.html: ranks the posts, pages and external links in
// search.json with MiniSearch (js/minisearch.min.js). DECISIONS.md says why it works this way.
(function () {
  'use strict';

  var LIMIT = 10;
  var script = document.currentScript;
  var input = document.getElementById('search-input');
  var results = document.getElementById('results-container');
  var hint = results.innerHTML;
  var index = null;

  // Lowercase and drop accents, so "resume" finds "Résumé"
  function fold(term) {
    return term.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function buildIndex(docs) {
    var miniSearch = new MiniSearch({
      fields: ['title', 'description', 'tags', 'terms'],
      storeFields: ['kind', 'url', 'title', 'description', 'date'],
      processTerm: fold,
      searchOptions: {
        boost: { title: 3, tags: 2, terms: 2, description: 1.5 },
        prefix: true,
        // Typos only in words of 5+ letters: allowing them in shorter words made "llm" match "Lam"
        fuzzy: function (term) { return term.length >= 5 ? 0.2 : false; }
      }
    });
    miniSearch.addAll(docs.map(function (doc, i) {
      doc.id = i;
      return doc;
    }));
    return miniSearch;
  }

  function message(text) {
    var item = document.createElement('li');
    item.className = 'search-result-message';
    item.textContent = text;
    results.appendChild(item);
  }

  function resultItem(hit) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = hit.url;
    link.textContent = hit.title;
    if (hit.description) link.title = hit.description;
    item.appendChild(link);

    var meta = document.createElement('span');
    meta.className = 'search-result-meta';
    if (hit.kind === 'link') {
      // Say where an external link goes before anyone follows it
      meta.textContent = '↗ ' + new URL(hit.url).hostname.replace(/^www\./, '').toLowerCase();
    } else {
      meta.textContent = hit.date || 'Page';
    }
    item.appendChild(meta);
    return item;
  }

  function render() {
    var query = input.value.trim();
    results.textContent = '';
    if (!query) {
      results.innerHTML = hint;
      return;
    }
    if (!index) {
      message('Loading…');
      return;
    }
    var hits = index.search(query).slice(0, LIMIT);
    if (!hits.length) {
      message('No results found');
      return;
    }
    hits.forEach(function (hit) {
      results.appendChild(resultItem(hit));
    });
  }

  // Keep the query in the address bar, so Back returns to the same results
  function rememberQuery() {
    var url = new URL(window.location.href);
    var query = input.value.trim();
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url);
  }

  input.addEventListener('input', function () {
    render();
    rememberQuery();
  });

  // /search/?q=... (the Office Assistant's search box) runs that search straight away
  var query = new URLSearchParams(window.location.search).get('q');
  if (query) input.value = query;

  fetch(script.getAttribute('data-index'))
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (docs) {
      index = buildIndex(docs);
      render();
    })
    .catch(function () {
      results.textContent = '';
      message("Search isn't working right now. Try again later.");
    });
})();
