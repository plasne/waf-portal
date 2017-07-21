
String.prototype.toArrayOfStrings = function() {
    return this.split(",").map(function(code) {
        return code.trim();
    });
}

String.prototype.toArrayOfIntegers = function() {
    return this.split(",").map(function(code) {
        code = code.trim();
        return (isNaN(code)) ? null : parseInt(code);
    }).filter(function(code) {
        return (code != null);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    const val = decodeURIComponent(results[2].replace(/\+/g, " "));
    if (isNaN(val)) {
        return val.toString();
    } else {
        return parseInt(val);
    }
}

function getQueryURL() {

    // get the variables
    const status = $("#status").val().toString();
    const from_date = $("#from-date").val();
    const from_time = $("#from-time").val();
    const from = moment(from_date + " " + from_time, "D MMMM, YYYY h:mm A");
    const to_date = $("#to-date").val();
    const to_time = $("#to-time").val();
    const to = moment(to_date + " " + to_time);
    const responseCode = $("#responseCode").val().toString();
    const responseTime = $("#responseTime").val().toString();

    // generate the URL
    const url = "/logs?" +
        ((status) ? "status=" + status + "&" : "") +
        ((from.isValid()) ? "from=" + from.valueOf() + "&" : "") +
        ((to.isValid()) ? "to=" + to.valueOf() + "&" : "") +
        ((responseCode) ? "responseCode=" + responseCode + "&" : "") +
        ((responseTime) ? "responseTime=" + responseTime + "&" : "");

    return url;
}

function query(table) {
    $.ajax({
        url: getQueryURL(),
        json: true
    }).done(function(logs, status, xhr) {
        table.clear();
        table.rows.add(logs);
        table.draw();
    }).fail(function(xhr, status, error) {
        alert("fail");
    });
}

$(document).ready(function() {

    // get query string parameters
    const status = getParameterByName("status");
    const from = getParameterByName("from");
    const to = getParameterByName("to");
    let responseCode = getParameterByName("responseCode");
    let responseTime = getParameterByName("responseTime");

    // setup query criteria
    $("#status").val(status).selectize({
        create: false,
        allowEmptyOption: true
    });
    $("#violations").selectize({
        create: false,
        allowEmptyOption: true,
        maxItems: null,
        render: {
            item: function(item, escape) {
                if (item.value === "") {
                    return "<div>any</div>";
                } else if (item.value == 0) {
                    return "<div><img src='img/5-good.png' /></div>";
                } else {
                    return "<div><img src='img/" + item.value + "-bad.png' /></div>";
                }
            },
            option: function(item, escape) {
                if (item.value === "") {
                    return "<div>any</div>";
                } else if (item.value == 0) {
                    return "<div><img src='img/5-good.png' /></div>";
                } else {
                    return "<div><img src='img/" + item.value + "-bad.png' /></div>";
                }
            }
        }
    });
    if (Number.isInteger(from)) {
        $("#from-date").val( moment(from).format("D MMMM, YYYY") );
        $("#from-time").val( moment(from).format("h:mm A") );
    }
    $("#from-date").pickadate();
    $("#from-time").pickatime();
    if (Number.isInteger(from)) {
        $("#to-date").val( moment(to).format("D MMMM, YYYY") );
        $("#to-time").val( moment(to).format("h:mm A") );
    }
    $("#to-date").pickadate();
    $("#to-time").pickatime();
    $("#srcIP").selectize({
        create: true,
        placeholder: "11.*, 11.11.11.11, etc."
    });
    $("#url").selectize({
        create: true
    });
    if (responseCode) responseCode = responseCode.toString().toArrayOfIntegers();
    $("#responseCode").selectize({
        create: true,
        items: responseCode,
        maxItems: null
    });
    if (responseTime) $("#responseTime").val(responseTime);
    $("#responseTime").selectize({
        create: true,
        placeholder: ">20, <40, etc.",
        maxItems: null
    });

    // define the table
    const table = $("#logs > table").DataTable({
        columns: [
            {
                data: "status",
                width: "20px",
                className: "centered",
                render: function(data, type, row) {
                    if (type === "display") {
                        switch(data) {
                            case "allowed":
                                return "<img src='img/check.png' />";
                            case "blocked":
                                return "<img src='img/x.png' />";
                            default:
                                return data;
                        }
                    } else {
                        return data;
                    }
                }
            },
            {
                data: "rating",
                width: "100px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return (data === 0) ? "<img src='img/5-good.png' />" : "<img src='img/" + data + "-bad.png' />";
                    } else {
                        return data;
                    }
                }
            },
            {
                data: "time",
                width: "150px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return moment(data).format("M-D-YY H:mm:ss");
                    } else {
                        return data;
                    }
                }
            },
            {
                data: "srcIP",
                width: "180px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<img class='flag' src='flags/4x3/" + row.srcCountry + ".svg' /> " + data;
                    } else {
                        return data;
                    }
                }
            },
            {
                data: "url"
            },
            {
                data: "responseCode",
                width: "50px",
                render: function(data, type, row) {
                    if (type === "display") {
                        if (data >= 100 && data <= 399) { // info, success, redirection
                            return "<img src='img/check.png' /> " + data;
                        } else {
                            return "<img src='img/x.png' /> " + data;
                        }
                    } else {
                        return data;
                    }
                },
                className: "centered"
            },
            {
                data: "responseTime",
                width: "50px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return data + "ms <img src='img/" + row.responseCategory + ".png' />";
                    } else {
                        return data;
                    }
                },
                className: "right"
            }
        ],
        order: [[2, "asc"]],
        pageLength: 10
    });

    // query with the defaults
    query(table);

    // query on button click
    $("#query").click(function() {
        query(table);
    });

});