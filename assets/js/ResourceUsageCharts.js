// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const { postMessage } = acquireVsCodeApi();
    let myChart;
    const mapKind2Theme = {
        1: 'light',
        2: 'dark',
    };
    let theme = "dark";
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                console.log('param', params);
                if (params[0].value[1] === '-') {
                    return '';
                }
                let eleArr = params.map(item => item.marker + item.seriesName + option.yAxis.name + '<span style="font-weight: bold;float: right;">' + "&nbsp;" + item.value[1] + '%</span>');
                return [params[0].axisValueLabel, ...eleArr].join("<br />");
            },
            axisPointer: {
                animation: false,
            },
        },
        legend: {
            data: ['CPU', 'MEM'],
            icon: 'rect',
            bottom: 10,
        },
        xAxis: {
            name: "时间",
            type: 'category',
            nameGap: 20,
            boundaryGap: true,
            // 刻度
            axisTick: {
                alignWithLabel: true,
            },
            // 标签
            axisLabel: {
                formatter: function (value) {
                    return value.split(" ")[1];
                },
            },
            nameLocation: 'end',
        },
        yAxis: {
            name: '使用率',
            type: 'value',
            nameGap: 20,
            splitLine: {
                show: false,
            },
            axisLabel: { formatter: '{value}%' },
        },
        series: [
            {
                name: 'CPU',
                type: 'line',
                showSymbol: true,
                data: [],
                areaStyle: {},
            },
            {
                name: 'MEM',
                type: 'line',
                showSymbol: true,
                data: [],
                areaStyle: {},
            },
        ]
    };
    // 要取消选中的图例，初始为空
    let deselectedLegends = [];
    // 可视区最大展示的数据条数
    const maxCount = 30;
    // 是否展示图例
    let shouldShowChart = false;

    function setChartData(sourceData) {
        console.log('deselectedLegends', deselectedLegends);
        if (deselectedLegends.length === option.legend.length) {
            console.log('已全部unselect');
            return;
        }

        // 设置series
        Object.entries(sourceData).forEach(([key, value]) => {
            setSeriesData(key, value);
        });
        myChart.setOption(option);

        // 取消选中
        deselectedLegends.forEach(name => {
            console.log('legendUnSelect', name);
            myChart.dispatchAction({
                type: 'legendUnSelect',
                name,
            });
        });
    }

    window.onload = () => {
        myChart = echarts.init(document.getElementById("chart-container"), theme);
        myChart.on('legendselectchanged', function (params) {
            console.log('legendselectchanged', params);
            const isSelected = params.selected[params.name];
            console.log((isSelected ? '选中了' : '取消选中了') + ' 图例 ' + params.name);
            if (!isSelected) {
                deselectedLegends.push(params.name);
            } else {
                const index = deselectedLegends.findIndex(item => item === params.name);
                if (index !== -1) {
                    deselectedLegends.splice(index, 1);
                }
            }
            postMessage({
                command: "set-unselected-legend",
                data: deselectedLegends,
            });
        });
    };
    // window.addEventListener('resize', function () {
    //     myChart.resize();
    // });
    function setSeriesData(key, sourceData) {
        let data = [];
        const srcDataLength = sourceData.length;
        const timeUnit = 2 * 1000;
        const fillEmptyLength = maxCount - srcDataLength;

        // 不足maxCount时用空数据填充
        for (let i = 0; i < fillEmptyLength; i++) {
            const now = new Date(+new Date(sourceData[0].ts) - (fillEmptyLength - i) * timeUnit);
            data.push({
                value: [getTime(now), "-"]
            });
        }

        // 填充真实数据
        for (let i = 0; i < srcDataLength; i++) {
            const now = new Date(sourceData[i].ts);
            const value = key === 'cpuInfos' ? `${(100 - sourceData[i].idle).toFixed(2)}` : `${(100 * (1 - sourceData[i].free / sourceData[i].total)).toFixed(2)}`;
            data.push({
                value: [getTime(now), value]
            });
        }
        if (data.length > maxCount) {
            data.splice(0, data.length - maxCount);
        }
        option.series[key === 'cpuInfos' ? 0 : 1].data = data;
    }

    function getTime(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        const padStart = (num) => String(num).padStart(2, '0');

        [month, day] = [month, day].map(padStart);
        [hour, minute, second] = [hour, minute, second].map(padStart);
        return [year, month, day].join("/") + " " + [hour, minute, second].join(":");
    }

    window.addEventListener('message', event => {
        const { command, data, themeKind, unselectedLegend = [] } = event.data;
        console.log('chart.js message', command, data, themeKind, unselectedLegend);

        // 定时更新series数据
        if (command === 'update') {
            shouldShowChart = true;
            if (unselectedLegend.length) {
                deselectedLegends = unselectedLegend;
            }
            setChartData(data);
            return;
        }
        // 修改theme，重新init
        if (command === 'set-theme') {
            console.log('on set theme', themeKind);
            if (![1, 2].includes(themeKind)) {
                console.log('目前只支持Light 和 Dark的theme');
                return;
            }
            if (theme && mapKind2Theme[themeKind] === theme) {
                console.log("theme没有改变");
                return;
            }
            theme = mapKind2Theme[themeKind];
            if (shouldShowChart) {
                console.log('dispose');
                myChart.dispose();
                console.log('re init');
                myChart = echarts.init(document.getElementById('chart-container'), theme);
                myChart.setOption(option);
            }
        }
    });

})();