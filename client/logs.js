
function getQueryURL() {

    // get the variables
    const status = $("#status").val().toString();
    const violations = $("#violations").val().toString();
    const from_date = $("#from-date").val();
    const from_time = $("#from-time").val();
    const from = moment(from_date + " " + from_time, "D MMMM, YYYY h:mm A");
    const to_date = $("#to-date").val();
    const to_time = $("#to-time").val();
    const to = moment(to_date + " " + to_time);
    const country = $("#country").val();
    const responseCode = $("#responseCode").val().toString();
    const responseTime = $("#responseTime").val().toString();

    // generate the URL
    const url = "/logs?" +
        ((status) ? "status=" + status + "&" : "") +
        ((violations) ? "violations=" + violations + "&" : "") +
        ((from.isValid()) ? "from=" + from.valueOf() + "&" : "") +
        ((to.isValid()) ? "to=" + to.valueOf() + "&" : "") +
        ((country) ? "country=" + country + "&" : "") +
        ((responseCode) ? "responseCode=" + responseCode + "&" : "") +
        ((responseTime) ? "responseTime=" + responseTime + "&" : "");

    return url;
}

function isProcessing(state) {
    if (state) {
        $(".dataTables_processing", $("#logs table").closest(".dataTables_wrapper")).show();
    } else {
        $(".dataTables_processing", $("#logs table").closest(".dataTables_wrapper")).hide();
    }
}

function query(table) {
    isProcessing(true);
    $.ajax({
        url: getQueryURL(),
        json: true
    }).done(function(logs, status, xhr) {
        table.clear();
        table.rows.add(logs);
        table.draw();
        isProcessing(false);
    }).fail(function(xhr, status, error) {
        isProcessing(false);
        if (xhr.status == 401 && xhr.responseText == "unauthorized") {
            window.open("/login", "_self");
        } else {
            alert("fail");
        }
    });
}

function displayCriteria(table) {

    // query for a list of violations
    const p1 = $.ajax({
        url: "/violations",
        json: true
    });

    // query for a list of countries
    const p2 = $.ajax({
        url: "/countries",
        json: true
    });

    // when all queries are done
    $.when(p1, p2).done(function(r1, r2) {
        const categories = r1[0];
        const countries = r2[0];

        // get query string parameters
        const status = getParameterByName("status");
        let violations = getParameterByName("violations");
        const from = getParameterByName("from");
        const to = getParameterByName("to");
        let country = getParameterByName("country");
        let responseCode = getParameterByName("responseCode");
        let responseTime = getParameterByName("responseTime");

        // status
        $("#status").val(status).chosen({
            width: "100%"
        });

        // violations
        const tag_violations = $("#violations");
        const violations_list = categories.forEach(function(category) {
            const optgroup = $("<optgroup />").attr("label", category.name).appendTo(tag_violations);
            category.violations.forEach(function(violation) {
                $("<option />").val(violation.id).text(violation.name).appendTo(optgroup);
            });
            $("</optgroup>").appendTo(tag_violations);
        });
        if (violations) violations = violations.toString().toArrayOfStrings();
        $("#violations").val(violations).chosen({
            width: "100%",
            placeholder_text_multiple: " "
        });

        // ratings
        $("#ratings").chosen({
            width: "100%",
            placeholder_text_multiple: " "
        });

        // from
        if (from && !isNaN(from)) {
            const ts = moment(parseInt(from));
            $("#from-date").val( ts.format("D MMMM, YYYY") );
            $("#from-time").val( ts.format("h:mm A") );
        }
        $("#from-date").pickadate();
        $("#from-time").pickatime();

        // to
        if (to && !isNaN(to)) {
            const ts = moment(parseInt(to));
            $("#to-date").val( ts.format("D MMMM, YYYY") );
            $("#to-time").val( ts.format("h:mm A") );
        }
        $("#to-date").pickadate();
        $("#to-time").pickatime();

        // country
        const tag_country = $("#country");
        countries.forEach(function(country) {
            $("<option />").val(country.id).text(country.name).appendTo(tag_country);
        });
        if (country) country = country.toString().toArrayOfStrings();
        $("#country").val(country).chosen({
            width: "100%",
            placeholder_text_multiple: " "
        });

        // response code
        if (responseCode) responseCode = responseCode.toString().toArrayOfIntegers();
        $("#responseCode").val(responseCode).chosen({
            width: "100%",
            placeholder_text_multiple: " "
        });

        // response time
        if (responseTime) $("#responseTime").val(responseTime);

        // display the criteria
        $("#query-criteria").css("display", "flex");

        // query with the incoming values
        query(table);

    }).fail(function(xhr, status, error) {
        if (xhr.status == 401 && xhr.responseText == "unauthorized") {
            window.open("/login", "_self");
        } else {
            alert("fail");
        }
    });

}

function lookup(violations) {
    window.open("/violations.html?violations=" + violations, "_blank");
}

function detail(data) {

    // generate an item
    const item = function(name, value, icon) {
        return "<div>" +
            "<div>" + name + ":</div>" +
            "<div class='indent'>" +
            ((icon) ? "<img src='" + icon + "' /> " : "") +
            value +
            "</div>" +
            "</div>";
    }

    // generate the whole container
    return "<div class='detail'>" +
        "<div class='detail-items'>" +
        item("Security Policy", data.securityPolicy) +
        item("Support ID", data.supportId) +
        item("Severity", data.severity, (data.severity === "Error") ? "img/x.png" : "img/check.png") +
        item("Username", data.username) +
        item("Session ID", data.sessionId) +
        item("Destination IP", data.dstIP) +
        item("Origin Country", data.country, "flags/4x3/" + data.countryId + ".svg") +
        "</div><div class='detail-btns'>" +
        ((data.status === "allowed") ? "<div><input type='button' value='block' disabled /></div>" : "") +
        ((data.status === "blocked") ? "<div><input type='button' value='allow' disabled /></div>" : "") +
        ((data.status === "blocked") ? "<div><input type='button' value='lookup violations' onclick='lookup(\"" + data.violations + "\")' /></div>" : "") +
        "<div><input type='button' value='block origin country' disabled /></div>" +
        "<div><input type='button' value='block source IP' disabled /></div>" +
        "</div>" +
        "</div>";

}

$(document).ready(function() {

    // define the table
    const table = $("#logs > table").DataTable({
        columns: [
            {
                title: "Status",
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
                title: "Violations",
                data: "violations",
                width: "100px"
            },
            {
                title: "Violation Rating",
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
                title: "Timestamp",
                data: "time",
                width: "160px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return moment(data).format("M-D-YY H:mm:ss");
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "Source IP",
                data: "srcIP",
                width: "200px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<img class='flag' src='flags/4x3/" + row.countryId + ".svg' /> " + data;
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "Requested URL",
                data: "url"
            },
            {
                title: "Response Code",
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
                title: "Response Time",
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
        order: [[3, "asc"]],
        pageLength: 10,
        processing: true
    });

    // add row selection
    $("#logs table tbody").on("click", "tr", function () {
        if ($(this).attr("role") === "row") {

            // remove selected style and hide the details window
            $(this).siblings("tr.selected").removeClass("selected").each(function(_, tr) {
                const p_row = table.row(tr);
                if (p_row.child.isShown()) {
                    p_row.child.hide();
                }
            });

            // toggle the class and detail state
            $(this).toggleClass("selected");
            const row = table.row(this);
            if (row.child.isShown()) {
                row.child.hide();
            } else {
                const details = detail(row.data());
                row.child(details).show();
            }

        }
    });

    // display the search criteria
    displayCriteria(table);

    // fix Edge bug where the page options aren't shown
    const pageLengthOptions = $("select[name='DataTables_Table_0_length']");
    const countOfPageLengthOptions = $(pageLengthOptions).children().length;
    if (countOfPageLengthOptions < 1) {
        $("<option />").val(10).text(10).appendTo(pageLengthOptions);
        $("<option />").val(25).text(25).appendTo(pageLengthOptions);
        $("<option />").val(50).text(50).appendTo(pageLengthOptions);
        $("<option />").val(100).text(100).appendTo(pageLengthOptions);
    }

    // query on button click
    $("#query").click(function() {
        query(table);
    });

});