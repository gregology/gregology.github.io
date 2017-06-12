# ignore the "bit" stuff.. only relevant to my custom jekyll fork

desc 'create new post'
# rake new My New Post"
task :new do
  require 'rubygems'
  require 'chronic'

  ARGV.each { |a| task a.to_sym do ; end }

  title = ARGV[1..-1].join(' ') || "New Title"
  slug = title.gsub(' ','-').downcase

  TARGET_DIR = "_posts"

  filename = "#{Time.new.strftime('%Y-%m-%d')}-#{slug}.md"
  permalink = "/#{Time.new.strftime('%Y/%m')}/#{slug}/"

  path = File.join(TARGET_DIR, filename)
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
  system "open -a atom #{path}"
end
