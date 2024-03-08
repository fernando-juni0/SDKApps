let getLast7Days = () => [...Array(7)].map((_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}`;
});


let colorsBack = [getComputedStyle(document.querySelector(`[data-theme=${document.body.getAttribute('data-theme')}]`)).getPropertyValue('--color-text-primary'), getComputedStyle(document.querySelector(`[data-theme=${document.body.getAttribute('data-theme')}]`)).getPropertyValue('--text-gray-color-primary')]




completeChart(getLast7Days(), colorsBack)
function completeChart(lastDays, colorsBack) {
    var options = {
        series: [{
            name: "Vendas",
            color: '#6E58C7',
            data: [10, 41, 35, 51, 49, 62, 69]
        }],
        chart: {
            type: 'line',
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Vendas Completas',
            align: 'center',
            style: {
                
                fontWeight: 'bold',
                fontFamily: 'ubuntu',
                color: colorsBack[0]
            },
        },
        grid: {
            row: {
                colors: colorsBack, 
                opacity: 0.7
            },
        },
        xaxis: {
            categories: lastDays,
            labels: {
                style: {
                    colors: colorsBack[1],
                    fontWeight: 400,
                },
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: colorsBack[1]
                }
            }
        }
    };

    var chart = new ApexCharts(document.querySelector("#vendas-completas-chart"), options);
    chart.render();
}


cancelChart(getLast7Days(), colorsBack)
function cancelChart(lastDays, colorsBack) {
    var options = {
        series: [{
            name: "Canceladas",
            color: '#6E58C7',
            data: [10, 41, 35, 51, 49, 62, 69]
        }],
        chart: {
            type: 'line',
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Vendas Canceladas',
            align: 'center',
            style: {
                
                fontWeight: 'bold',
                fontFamily: 'ubuntu',
                color: colorsBack[0]
            },
        },
        grid: {
            row: {
                colors: colorsBack, 
                opacity: 0.7
            },
        },
        xaxis: {
            categories: lastDays,
            labels: {
                style: {
                    colors: colorsBack[1],
                    fontWeight: 400,
                },
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: colorsBack[1] 
                }
            }
        },
        responsive: [{
            breakpoint: 1000,
            options: {
                plotOptions: {
                    bar: {
                        horizontal: false
                    }
                },
            }
        }]

    };

    var chart = new ApexCharts(document.querySelector("#vendas-canceladas-chart"), options);
    chart.render();
}



document.getElementById('top-header-theme').addEventListener('click',async()=>{
    colorsBack = [getComputedStyle(document.querySelector(`[data-theme=${document.body.getAttribute('data-theme')}]`)).getPropertyValue('--color-text-primary'), getComputedStyle(document.querySelector(`[data-theme=${document.body.getAttribute('data-theme')}]`)).getPropertyValue('--text-gray-color-primary')]
    document.querySelector("#vendas-completas-chart").innerHTML = ''
    document.querySelector("#vendas-canceladas-chart").innerHTML = ''
    completeChart(getLast7Days(), colorsBack)
    cancelChart(getLast7Days(), colorsBack)
})