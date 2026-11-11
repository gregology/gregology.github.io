module Jekyll
  # A clear-signed source file (`_posts/<file>.md.asc`, `resume.md.asc`), copied unchanged
  # to a URL beside the page's .md version.
  class SignatureFile < StaticFile
    def initialize(site, relative_path, url)
      super(site, site.source, File.dirname(relative_path), File.basename(relative_path))
      @signature_url = url
    end

    def url
      @signature_url
    end

    def destination(dest)
      @site.in_dest_dir(dest, @signature_url)
    end
  end

  # Publishes the signature of every post and every `signed: true` page beside its .md version:
  # /2026/11/some-post/ is signed by /2026/11/some-post.md.asc. Sets `signature_url` for
  # _includes/signature.html. A file without a .asc yet is skipped.
  class SignatureFileGenerator < Generator
    safe true
    priority :low

    def generate(site)
      signed = site.posts.docs.map { |post| [post, post.relative_path] } +
               site.pages.select { |page| page.data['signed'] }.map { |page| [page, page.path] }

      signed.each do |item, relative_path|
        signature = "#{relative_path}.asc"
        next unless File.file?(site.in_source_dir(signature))

        url = signature_url_for(item.url)
        item.data['signature_url'] = url
        site.static_files << SignatureFile.new(site, signature, url)
      end
    end

    private

    # Same rule as the .md versions in markdown_page_generator.rb, plus .asc
    def signature_url_for(url)
      return '/index.md.asc' if url == '/'

      url.sub(%r{/$}, '') + '.md.asc'
    end
  end
end
