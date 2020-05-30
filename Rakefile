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


desc 'collect tweets'
task :tweets do
  require 'yaml'
  require 'twitter'
  creds = YAML.load_file('_creds.yml')
  client = Twitter::REST::Client.new do |config|
    config.consumer_key        = creds["twitter"]["api_key"]
    config.consumer_secret     = creds["twitter"]["api_secret_key"]
    config.access_token        = creds["twitter"]["access_token"]
    config.access_token_secret = creds["twitter"]["access_token_secret"]
  end

  twitter_accounts = ['gregologynet', 'memairapp', 'smileyom', 'svcatsaway', 'wikijam', 'ghostisp']

  tweets = []
  twitter_accounts.each do |twitter_account|
    puts "collecting tweets for #{twitter_account}"

    max_id = nil
    max_tries = 20
    max_tries.times do
      new_tweets = max_id.nil? ? client.user_timeline(twitter_account, count: 200) : client.user_timeline(twitter_account, count: 200, max_id: max_id)
      break if new_tweets.empty?
      puts "#{new_tweets.count} tweets extracted from #{new_tweets.last.created_at} to #{new_tweets.first.created_at}"
      tweets += new_tweets
      max_id = new_tweets[-1].id - 1
    end
  end

  puts "collected #{tweets.count} tweets"

  tweets = tweets.sort_by!(&:created_at)
  tweets = tweets.map { |tweet| tweet.to_hash }

  File.open('api/tweets.json', 'w+') do |file|
    file.puts tweets.to_json
  end
end


desc 'collect wikipedia edits'
task :wikipedia do
  require 'json'
  require 'net/http'
  require 'active_support/core_ext/hash'

  edits = []

  years = (2005..Time.new.year).to_a
  years.each do | year |
    puts "collecting wikipedia edits from #{year}"
    url = "https://en.wikipedia.org/w/api.php?action=feedcontributions&user=gregology&year=#{year}"
    s = Net::HTTP.get_response(URI.parse(url)).body
    new_edits = Hash.from_xml(s)
    edits += new_edits['rss']['channel']['item']
  end

  edits = edits.uniq
  puts "#{edits.count} edits collected"
  edits = edits.each {|edit| edit['pubDate'] = edit['pubDate'].to_datetime.to_s }
  edits = edits.sort_by { |edit| edit['pubDate'] }

  File.open('api/wikipedia.json', 'w+') do |file|
    file.puts edits.to_json
  end
end