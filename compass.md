---
title: Political Compass
layout: page
comments: True
chart: True
licence: Creative Commons
---

Every 6 months I take the [Political Compass test](https://www.politicalcompass.org/test) to see how my beliefs drift over time. Here are the results so far.

### Economic

<canvas id="economicChart" width="400" height="150"></canvas>

### Social

<canvas id="socialChart" width="400" height="150"></canvas>

<script>
var economicChartData = {
    datasets: [
      {
        fill: false,
        data: [
          {
            t: new Date(2019, 11, 4),
            y: -5.25
          }, {
            t: new Date(2020, 6, 1),
            y: -6.38
          }, {
            t: new Date(2021, 1, 4),
            y: -7.38
          }, {
            t: new Date(2021, 7, 1),
            y: -5.13
          }, {
            t: new Date(2022, 1, 2),
            y: -5.75
          }, {
            t: new Date(2022, 7, 19),
            y: -7.25
          }
        ],
        borderColor: '#70c1b3',
        borderWidth: 3
      }
    ]
  }
  var ctx2 = document.getElementById("economicChart").getContext("2d");
  var economicChart = new Chart(ctx2, {
    type: 'line',
    data: economicChartData,
    options: {
      annotation: {
        events: ["click"],
        annotations: [
          {
            drawTime: "afterDatasetsDraw",
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: new Date(2021, 4, 1),
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 0,
            label: {
              backgroundColor: "#247ba0",
              content: "Right",
              enabled: true,
              position: "top"
            },
          },
          {
            drawTime: "afterDatasetsDraw",
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: new Date(2021, 4, 1),
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 0,
            label: {
              backgroundColor: "#f25f5c",
              content: "Left",
              enabled: true,
              position: "bottom"
            },
          }
        ]
      },
      legend: {
        display: false
      },
      elements: {
        point: {
          radius: 0
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'year'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: false
          },
          ticks: {
            suggestedMin: -10,
            suggestedMax: 10
          }
        }]
      }
    }
  });
</script>


<script>
var socialChartData = {
    datasets: [
      {
        fill: false,
        data: [
          {
            t: new Date(2019, 11, 4),
            y: -7.28
          }, {
            t: new Date(2020, 6, 1),
            y: -6.05
          }, {
            t: new Date(2021, 1, 4),
            y: -6.51
          }, {
            t: new Date(2021, 7, 1),
            y: -5.33
          }, {
            t: new Date(2022, 1, 2),
            y: -5.79
          }, {
            t: new Date(2022, 7, 19),
            y: -6.36
          }
        ],
        borderColor: '#70c1b3',
        borderWidth: 3
      }
    ]
  }
  var ctx2 = document.getElementById("socialChart").getContext("2d");
  var socialChart = new Chart(ctx2, {
    type: 'line',
    data: socialChartData,
    options: {
      annotation: {
        events: ["click"],
        annotations: [
          {
            drawTime: "afterDatasetsDraw",
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: new Date(2021, 4, 1),
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 0,
            label: {
              backgroundColor: "#247ba0",
              content: "Authoritarian",
              enabled: true,
              position: "top"
            },
          },
          {
            drawTime: "afterDatasetsDraw",
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: new Date(2021, 4, 1),
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 0,
            label: {
              backgroundColor: "#f25f5c",
              content: "Libertarian",
              enabled: true,
              position: "bottom"
            },
          }
        ]
      },
      legend: {
        display: false
      },
      elements: {
        point: {
          radius: 0
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'year'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: false
          },
          ticks: {
            suggestedMin: -10,
            suggestedMax: 10
          }
        }]
      }
    }
  });
</script>
