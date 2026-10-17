module Jekyll
  class MarkdownPageGenerator < Generator
    safe true
    priority :low

    LLMS_FULL_PERMALINK = '/llms-full.txt'

    def generate(site)
      generate_post_pages(site)
      generate_page_twins(site)
      generate_llms_full_page(site)
    end

    private

    # Output is filled in by the :site, :post_render hook below, once the twins have rendered
    def generate_llms_full_page(site)
      page = PageWithoutAFile.new(site, site.source, '', 'llms-full.txt')
      page.data['layout'] = 'none'
      page.data['permalink'] = LLMS_FULL_PERMALINK
      page.content = ''
      site.pages << page
    end

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

    def markdown_url_for(url)
      return '/index.md' if url == '/'

      url.sub(%r{/$}, '') + '.md'
    end

    def generate_post_pages(site)
      site.posts.docs.each do |post|
        permalink = markdown_url_for(post.url)
        post.data['markdown_url'] = permalink
        page = make_md_page(site, permalink, post.data['title'], post.url, post.content, 'post')
        site.pages << page
      end
    end

    def generate_page_twins(site)
      twin_source_pages(site).each do |source_page|
        permalink = markdown_url_for(source_page.url)
        source_page.data['markdown_url'] = permalink
        page = make_md_page(site, permalink, source_page.data['title'], source_page.url, source_page.content, 'page')
        site.pages << page
      end
    end

    # Internal links from navbar-links, using the same "://" rule as _includes/navbarlink.html
    def nav_link_paths(site)
      links = (site.config['navbar-links'] || {}).values.flat_map do |value|
        value.is_a?(Array) ? value.flat_map(&:values) : [value]
      end
      links.reject { |link| link.include?('://') }.map { |link| strip_slashes(link) }
    end

    def twin_source_pages(site)
      pages_by_path = {}
      site.pages.each do |page|
        next if page.data['twin_kind']

        pages_by_path[strip_slashes(page.url)] ||= page
      end

      sources = nav_link_paths(site).filter_map do |path|
        page = pages_by_path[path]
        Jekyll.logger.warn 'MarkdownPageGenerator:', "no page for navbar link '#{path}'" unless page
        page
      end
      sources.concat(site.pages.select { |page| page.data['markdown_twin'] == true })
      sources.uniq
    end

    def strip_slashes(path)
      path.gsub(%r{\A/+|/+\z}, '')
    end
  end
end

Jekyll::Hooks.register :site, :post_render do |site|
  llms_full = site.pages.find { |page| page.url == Jekyll::MarkdownPageGenerator::LLMS_FULL_PERMALINK }
  next unless llms_full

  page_twins = site.pages.select { |page| page.data['twin_kind'] == 'page' }
  post_twins = site.pages.select { |page| page.data['twin_kind'] == 'post' }.reverse
  sections = (page_twins + post_twins)
             .reject { |twin| twin.data['title'].to_s.strip.empty? }
             .map { |twin| twin.output.strip }

  header = "# #{site.config['title']}\n\n> #{site.config['description']}\n\n"
  llms_full.output = header + sections.join("\n\n") + "\n"
end
