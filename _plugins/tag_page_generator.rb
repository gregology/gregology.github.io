module Jekyll
  class TagPage < Page
    def initialize(site, tag)
      @site = site
      @base = site.source
      @dir = "tag/#{Utils.slugify(tag)}"
      @name = "index.html"

      process(@name)
      read_yaml(File.join(site.source, "_layouts"), "tag_index.html")

      data["tag"] = tag
      data["title"] = "Tag: #{tag}"
      data["robots"] = "noindex, follow"
    end
  end

  class TagPageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      return unless site.layouts.key?("tag_index")

      tags = site.posts.docs.flat_map { |post| post.data["tags"] || [] }.uniq
      tags.each do |tag|
        site.pages << TagPage.new(site, tag)
      end
    end
  end
end
