function chart(monthlySalesData, yearlySalesData) {
    // Fill in missing months with zero values
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1); // Array representing all months (1 to 12)
    const monthlyDataMap = new Map(monthlySalesData.map(item => [item._id, item.totalAmount]));
    const monthlyDataFilled = allMonths.map(month => ({ _id: month, totalAmount: monthlyDataMap.get(month) || 0 }));

    // Monthly sales chart
    if ($('#monthlyChart').length) {
        var monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        var monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: monthlyDataFilled.map(item => item._id),
                datasets: [{
                    label: 'Monthly Sales',
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: monthlyDataFilled.map(item => item.totalAmount)
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    }

    // Daily sales chart
    if ($('#YearlyChart').length) {
        var dailyCtx = document.getElementById('YearlyChart').getContext('2d');
        var dailyChart = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: yearlySalesData.map(item => item._id),
                datasets: [{
                    label: 'Yearly Sales',
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: yearlySalesData.map(item => item.totalAmount)
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    }
}

function pieChart(eachOrderStatusCount) {
    if ($('#myChart2').length) {
        var statusLabels = Object.keys(eachOrderStatusCount);
        var statusData = Object.values(eachOrderStatusCount);

        var ctx = document.getElementById('myChart2').getContext('2d');
        var myChart2 = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }
}
