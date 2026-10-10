module Jekyll
  class MarkdownPageGenerator < Generator
    safe true
    priority :low

    NAV_PAGE_SLUGS = %w[
      about codex bucket timeline resume compass api
      posts packages patents deprecated secure
    ].freeze

    def generate(site)
      generate_post_pages(site)
      generate_nav_pages(site)
    end

    private

    def make_md_page(site, permalink, title, original_url, raw_content, kind)
      # Use .txt extension so Jekyll won't process content as markdown
      unique_name = permalink.tr('/', '_').sub(/^_/, '').sub(/\.md$/, '.txt')
      page = PageWithoutAFile.new(site, site.source, '', unique_name)
      page.data['layout'] = 'markdown'
      page.data['title'] = title
      page.data['original_url'] = original_url
      page.data['permalink'] = permalink
      page.data['twin_kind'] = kind
      page.content = raw_content
      page
    end

    def generate_post_pages(site)
      site.posts.docs.each do |post|
        permalink = post.url.sub(%r{/$}, '') + '.md'
        post.data['markdown_url'] = permalink
        page = make_md_page(site, permalink, post.data['title'], post.url, post.content, 'post')
        site.pages << page
      end
    end

    def generate_nav_pages(site)
      nav_sources = find_nav_sources(site)

      NAV_PAGE_SLUGS.each do |slug|
        source_page = nav_sources[slug]
        next unless source_page

        permalink = "/#{slug}.md"
        source_page.data['markdown_url'] = permalink
        page = make_md_page(site, permalink, source_page.data['title'], source_page.url, source_page.content, 'page')
        site.pages << page
      end
    end

    def find_nav_sources(site)
      sources = {}
      site.pages.each do |page|
        slug = if page.name == 'index.md' || page.name == 'index.html'
                 File.dirname(page.relative_path).sub(%r{^/}, '')
               else
                 File.basename(page.name, File.extname(page.name))
               end
        sources[slug] = page if NAV_PAGE_SLUGS.include?(slug)
      end
      sources
    end
  end
end
