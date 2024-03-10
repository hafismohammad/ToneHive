$(document).ready(function() {
    "use strict";

    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        let ctx = document.getElementById('myChart').getContext('2d');

        let monthlyStr = $('#myChartData').data('monthly');
        if (monthlyStr) {
            let monthlyData = monthlyStr.split(',').map(Number);

            let chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                        {
                            label: 'Monthly',
                            tension: 0.3,
                            fill: true,
                            backgroundColor: 'rgba(4, 209, 130, 0.2)',
                            borderColor: 'rgb(4, 209, 130)',
                            data: monthlyData
                        }
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
    }

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        let ctx = document.getElementById("myChart2").getContext('2d');

        let orderStatus = $('#orderStatus').val();
        if (orderStatus) {
            orderStatus = JSON.parse(orderStatus);

            let myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'returned'],
                    datasets: [
                        {
                            label: "US",
                            backgroundColor: [
                                "#5897fb",
                                "#FFC154",
                                "#47B39C",
                                "#EC6B56",
                                "#EA5F89",
                                "#57167E"
                            ],
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            barThickness: 10,
                            data: [orderStatus.pending, orderStatus.confirmed, orderStatus.shipped, orderStatus.delivered, orderStatus.cancelled, orderStatus.returned]
                        }
                    ]
                },
                options: {
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
});
