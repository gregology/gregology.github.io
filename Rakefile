POST_DIR = "_posts"

desc 'create new post'
# rake new My New Post
task :new do
  require 'rubygems'
  require 'chronic'

  ARGV.each { |a| task a.to_sym do ; end }

  title = ARGV[1..-1].join(' ') || "New Title"
  slug = title.gsub(' ','-').downcase

  filename = "#{Time.new.strftime('%Y-%m-%d')}-#{slug}.md"
  permalink = "/#{Time.new.strftime('%Y/%m')}/#{slug}/"

  path = File.join(POST_DIR, filename)
  post = <<-HTML
---
title: "TITLE"
author: Greg
layout: post
permalink: PERMALINK
date: DATE
comments: True
licence: Creative Commons
categories:
  - category
tags:
  - tag
---
HTML
  post \
    .gsub!('TITLE', title) \
    .gsub!('DATE', Time.new.to_s) \
    .gsub!('PERMALINK', permalink)
  File.open(path, 'w') do |file|
    file.puts post
  end
  puts "new post generated in #{path}"
  system "code #{path}"
end

desc 'create YouTube channel video posts'
task :ytvids do
  require 'yaml'
  require 'yt'
  creds = YAML.load_file('_creds.yml')
  api_key = creds["google"]["api_key"]
  Yt.configure do |config|
    config.api_key = api_key
  end

  playlist = Yt::Playlist.new id: 'PL-3STrNltv3dVQBJPtpfRxdF3oKZeoIvp'
  puts playlist.title

  playlist.playlist_items.each do |video|
    filename = (video.published_at.strftime("%Y-%m-%d") + " " + video.title.downcase).parameterize + ".md"
    permalink = "/" + video.published_at.strftime("%Y/%m") + "/" + video.title.downcase.parameterize
    path = File.join(POST_DIR, filename)

    unless File.exist?(path)
      post = <<-HTML
---
title: "TITLE"
author: Greg
layout: post
permalink: PERMALINK
published_at: DATE
comments: True
licence: Creative Commons
categories:
  - YouTube
tags:
  - sailing
---

{% include youtube_player.html id='VIDEO_ID' %}

DESCRIPTION

HTML
      post \
        .gsub!('TITLE', video.title) \
        .gsub!('DATE', video.published_at.to_s) \
        .gsub!('PERMALINK', permalink) \
        .gsub!('VIDEO_ID', video.video_id) \
        .gsub!('DESCRIPTION', video.description)
      File.open(path, 'w') do |file|
        file.puts post
      end
      puts "new post generated in #{path}"
    end
  end
end
