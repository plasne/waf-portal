
// globals
const animationTime = 1000;
var threat_type_chart, threat_location_chart;
var traffic_rps_chart, traffic_in_chart, traffic_out_chart;
var threats; // need to hold the dataset so it can be mapped back for click events

// populate metrics
function clearMetrics() {
    $("#metrics > div").removeClass("good warn bad");
    $("#metrics-protection-percentage, #metrics-protection-allowed, #metrics-protection-blocked").text("???");
    $("#metrics-availability-percentage, #metrics-availability-success, #metrics-availability-fail").text("???");
    $("#metrics-response-avg").text("???");
}

function populateMetrics() {

    // clear during query
    clearMetrics();

    // query to get the latest data
    $.ajax({
        url: "/metrics",
        json: true
    }).done(function(metrics, status, xhr) {

        // protection
        $("#metrics-protection").addClass(metrics.protection.status);
        const protection_percentage = Math.round(metrics.protection.allowed / (metrics.protection.allowed + metrics.protection.blocked) * 100);
        $("#metrics-protection-percentage").text(protection_percentage + "%");
        $("#metrics-protection-allowed").text(metrics.protection.allowed.toPretty(1));
        $("#metrics-protection-blocked").text(metrics.protection.blocked.toPretty(1));

        // availability
        $("#metrics-availability").addClass(metrics.availability.status);
        const availability_percentage = Math.round(metrics.availability.success / (metrics.availability.success + metrics.availability.fail) * 100);
        $("#metrics-availability-percentage").text(availability_percentage + "%");
        $("#metrics-availability-success").text(metrics.availability.success.toPretty(1));
        $("#metrics-availability-fail").text(metrics.availability.fail.toPretty(1));

        // response times
        $("#metrics-response").addClass(metrics.response.status);
        $("#metrics-response-avg").text(metrics.response.avg + "ms");

    }).fail(function(xhr, status, error) {
        alert("fail");
    });

}

// populate a specific threat chart with data
function populateThreatChart(src, dst) {

    // clear the existing chart data
    dst.data.labels = [];
    dst.data.datasets[0].data = [];

    // push the new chart data
    src.forEach(function(entity) {
        dst.data.labels.push(entity.name);
        dst.data.datasets[0].data.push(entity.count);
    });
    dst.update();

}

// populate all threat charts with data
function populateThreatCharts() {

    // query to get the latest data
    $.ajax({
        url: "/threats",
        json: true
    }).done(function(t, status, xhr) {
        threats = t;
        populateThreatChart(t.byType, threat_type_chart);
        populateThreatChart(t.byCountry, threat_location_chart);
    }).fail(function(xhr, status, error) {
        alert("fail");
    });

}

// generate a threat chart
function generateThreatChart(ctx) {
    return new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: [],
            datasets: [
                {
                    data: [],
                    backgroundColor: [
                        "rgba(141, 182, 199, 1.0)",
                        "rgba(193, 179, 142, 1.0)",
                        "rgba(209, 198, 191, 1.0)",
                        "rgba(202, 159, 146, 1.0)",
                        "rgba(240, 205, 151, 1.0)",
                        "rgba(177, 194, 122, 1.0)",
                        "rgba(89, 173, 208, 1.0)",
                        "rgba(159, 163, 227, 1.0)",
                        "rgba(209, 141, 178, 1.0)",
                        "rgba(241, 195, 208, 1.0)"
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    const chart = elements[0]._chart.canvas.id;

                    // see which chart was selected
                    if (chart === "threat-type-chart") {
                        // open based on violation id

                        // id
                        const index = elements[0]._index;
                        const id = threats.byType[index].id;

                        // open window
                        window.open("/violations.html?violations=" + id, "_blank");

                    } else if (chart === "threat-country-chart") {
                        // open based on country

                        // id
                        const index = elements[0]._index;
                        const id = threats.byCountry[index].id;

                        // open window with 1 week of data
                        const now = new Date().getTime();
                        const oneWeekBack = now - (7 * 24 * 60 * 60 * 1000);
                        window.open("/logs.html?status=blocked&country=" + id + "&from=" + oneWeekBack + "&to=" + now, "_blank");

                    }
                }
            }
        }
    });
}

// populate a specific traffic chart with data
function populateTrafficChart(src, dst, timeframe, last) {

    // clear the existing chart data
    dst.data.labels = [];
    dst.data.datasets[0].data = [];
    dst.data.datasets[1].data = [];

    // push the new chart data
    timeframe.forEach(function(val) {
        //dst.data.labels.push(new Date(val));
        dst.data.labels.push(parseInt(val));
    });
    Array.prototype.push.apply(dst.data.datasets[0].data, src.http);
    Array.prototype.push.apply(dst.data.datasets[1].data, src.https);
    dst.update();

    // set the last value
    let last_value = src.http[src.http.length - 1] + src.https[src.https.length - 1];
    $(last).text(last_value.toPretty(1));

}

// populate all traffic charts with data
function populateTrafficCharts() {

    // query to get the latest data
    $.ajax({
        url: "/traffic",
        json: true
    }).done(function(traffic, status, xhr) {
        populateTrafficChart(traffic.rps, traffic_rps_chart, traffic.timeframe, "#traffic-rps-last");
        populateTrafficChart(traffic.in, traffic_in_chart, traffic.timeframe, "#traffic-in-last");
        populateTrafficChart(traffic.out, traffic_out_chart, traffic.timeframe, "#traffic-out-last");
    }).fail(function(xhr, status, error) {
        alert("fail");
    });

}

// generate a traffic chart
function generateTrafficChart(ctx, http, https, y) {
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: http,
                    data: [],
                    fill: "origin",
                    backgroundColor: "rgba(133, 202, 93, 0.2)",
                    borderColor: "rgba(133, 202, 93, 1.0)",
                    borderWidth: 1
                },
                {
                    label: https,
                    data: [],
                    fill: "origin",
                    backgroundColor: "rgba(174, 198, 207, 0.2)",
                    borderColor: "rgba(174, 198, 207, 1.0)",
                    borderWidth: 1
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                xAxes: [
                    {
                        id: "minutes",
                        type: "time",
                        time: {
                            unit: "minute",
                            round: true,
                            displayFormats: {
                                minute: "h:mm"
                            }
                        },
                        ticks: {
                            autoSkip: true
                        }
                    }
                ],
                yAxes: [
                    {
                        id: y,
                        type: "linear",
                        position: "left",
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ]
            }
        }
    });
}

// on document ready
$(document).ready(function() {

    // defaults
    Chart.defaults.global.defaultFontFamily = "Verdana, sans-serif";

    // create the threat charts
    const threat_type_chart_ctx = $("#threat-type-chart").get(0).getContext("2d");
    threat_type_chart = generateThreatChart(threat_type_chart_ctx);
    const threat_location_chart_ctx = $("#threat-country-chart").get(0).getContext("2d");
    threat_location_chart = generateThreatChart(threat_location_chart_ctx);

    // create the traffic charts
    const traffic_rps_chart_ctx = $("#traffic-rps-chart").get(0).getContext("2d");
    traffic_rps_chart = generateTrafficChart(traffic_rps_chart_ctx, "HTTP req/sec", "HTTPS req/sec", "req/sec");
    const traffic_in_chart_ctx = $("#traffic-in-chart").get(0).getContext("2d");
    traffic_in_chart = generateTrafficChart(traffic_in_chart_ctx, "HTTP bytes/sec", "HTTPS bytes/sec", "bytes/sec");
    const traffic_out_chart_ctx = $("#traffic-out-chart").get(0).getContext("2d");
    traffic_out_chart = generateTrafficChart(traffic_out_chart_ctx, "HTTP bytes/sec", "HTTPS bytes/sec", "bytes/sec");

    // activate traffic tabs
    const traffic_chart_width = 90;
    $("#traffic-chart-tabs .tab").click(function() {
        $("#traffic-chart-tabs .tab.selected").removeClass("selected").addClass("unselected");
        $(this).removeClass("unselected").addClass("selected");
    });
    $("#traffic-chart-tabs .tab:nth-child(1)").click(function() {
        $("#traffic-chart-container > div:nth-child(1)").animate({ left: "0vw" }, animationTime);
        $("#traffic-chart-container > div:nth-child(2)").animate({ left: traffic_chart_width + "vw" }, animationTime);
        $("#traffic-chart-container > div:nth-child(3)").animate({ left: (traffic_chart_width * 2) + "vw" }, animationTime);
    });
    $("#traffic-chart-tabs .tab:nth-child(2)").click(function() {
        $("#traffic-chart-container > div:nth-child(1)").animate({ left: -traffic_chart_width + "vw" }, animationTime);
        $("#traffic-chart-container > div:nth-child(2)").animate({ left: "0vw" }, animationTime);
        $("#traffic-chart-container > div:nth-child(3)").animate({ left: traffic_chart_width + "vw" }, animationTime);
    });
    $("#traffic-chart-tabs .tab:nth-child(3)").click(function() {
        $("#traffic-chart-container > div:nth-child(1)").animate({ left: (-traffic_chart_width * 2) + "vw" }, animationTime);
        $("#traffic-chart-container > div:nth-child(2)").animate({ left: -traffic_chart_width + "vw" }, animationTime);
        $("#traffic-chart-container > div:nth-child(3)").animate({ left: "0vw" }, animationTime);
    });

    // populate the data
    populateMetrics();
    populateThreatCharts();
    populateTrafficCharts();

    // commonly used timestamps
    const now = new Date().getTime();
    const oneHourBack = now - (1 * 60 * 60 * 1000);

    // add clicks for drill-thru
    $("#metrics-protection").click(function() {
        window.open("/logs.html?status=blocked&from=" + oneHourBack + "&to=" + now, "_blank");
    });
    $("#metrics-availability").click(function() {
        window.open("/logs.html?responseCode=500&from=" + oneHourBack + "&to=" + now, "_blank");
    });
    $("#metrics-response").click(function() {
        window.open("/logs.html?responseTime=>30&from=" + oneHourBack + "&to=" + now, "_blank");
    });

    // hide extra details if too small
    $(window).resize(function() {
        const box = $("#metrics div.metrics-box");
        if ($(box).width() < 325 || $(box).height() < 44) {
            $("#metrics .extra").hide();
        } else {
            $("#metrics .extra").show();
        }
    }).trigger("resize");

});