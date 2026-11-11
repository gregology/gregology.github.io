---
title: "Greg vs Facebook"
description: "I charted my Facebook usage from 2008 to 2017. Sessions kept climbing, and so did middle-of-the-night activity. Facebook's winning."
author: Greg
layout: post
permalink: /2018/10/greg-vs-facebook/
date: 2018-10-19 16:09:54 -0400
comments: True
charts: True
licence: Creative Commons
categories:
  - personal
tags:
  - quantified self
  - privacy
search_terms: [social media, social network, screen time, addiction, chart, graph, line chart, google charts, data visualization, data visualisation, personal data, habits, trends, meta, fb, statistics, self tracking, personal analytics, digital wellbeing, late night, versus, usage stats]
---

<script type="text/javascript">
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Year', 'Sessions', 'Middle of night sessions'],
      ['2008',  376,        34],
      ['2009',  517,        36],
      ['2010',  424,        17],
      ['2011',  379,        21],
      ['2012',  1043,       50],
      ['2013',  1631,       127],
      ['2014',  1587,       110],
      ['2015',  1790,       189],
      ['2016',  1795,       205],
      ['2017',  1931,       316]
    ]);

    var options = {
      title: "Greg's Facebook Usage",
      curveType: 'function',
      legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
  }


</script>

<div id="curve_chart" style="width: 100%; height: 500px"></div>

Facebook's winning :(
