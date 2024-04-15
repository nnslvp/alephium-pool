function statsApiCall() {
  return fetch('https://api.alephium-pool.com/pool_history').then((response) =>
    response.json()
  );
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
  return [
    {
      data: data.map((e) => {
        const value = valueFormatter ? valueFormatter(e) : e[field];
        return [new Date(e.day).getTime(), Math.round(value)];
      }),
    },
  ];
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
  statsApiCall().then((response) => {
    const poolHistory = response.pool_history;

    drawChart(poolHistory, 'unique_wallets');
    drawChart(poolHistory, 'sum_difficulty');

    const calculateHashrate = (item) =>
      (item['sum_difficulty'] * 16.0 * 2 ** 30) / 86400 / 1000000;

    drawChart(poolHistory, 'hash_rate', calculateHashrate);
  });
}

DarkReader.enable({
    brightness: 100,
    contrast: 90,
    sepia: 10
});

Init();
