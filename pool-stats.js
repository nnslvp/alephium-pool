function statsApiCall() {
    return fetch('https://api.alephium-pool.com/pool_stats')
      .then(response => response.json())
}

function groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}

const defaultParams = {
    chart: {
        type: 'area',
        height: 350,
        stacked: true
    },
    colors: ['#ff79c6', '#bd93f9', '#8be9fd'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.6,
            opacityTo: 0.8,
        }
    },
    legend: {
        position: 'top',
        horizontalAlign: 'left'
    },
    xaxis: {
        type: 'datetime'
    }
};


function chartData(data, field, valueFormatter) {
    let groups = groupBy(data, "pool");

    return Object.entries(groups).map(([regionName, groupData]) => {
        const data = groupData.map(e => {
            const createElement = (value) => [new Date(e["date"]).getTime(), value];

            if (valueFormatter) {
                const formattedValue = valueFormatter(e);
                return createElement(Math.round(formattedValue));
            } else {
                return createElement(Math.round(e[field]));
            }
        });

        return {
            name: regionName,
            data
        };
    })
}

function drawChart(data, field, valueFormatter) {
    let chart = new ApexCharts(
      document.querySelector(`#chart_${field}`),
      {
          series: chartData(data, field, valueFormatter),
          ...defaultParams
      }
    );
    chart.render();
}

function Init() {
    statsApiCall().then(response => {
        const poolStats = response.pool_stats;

        drawChart(poolStats, "workers");
        drawChart(poolStats, "shares_difficulty");

        const calculateHashrate = (item) => ((item["shares_difficulty"] * 16.0 * (2 ** 30)) / 86400) / 1000000;
        drawChart(poolStats, "hash_rate", calculateHashrate);
    })
}

DarkReader.enable({
    brightness: 100,
    contrast: 90,
    sepia: 10
});

Init();
