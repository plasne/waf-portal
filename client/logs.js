
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function() {

    // get query string parameters
    const scope = getParameterByName("scope");
    const from = getParameterByName("from");
    const to = getParameterByName("to");

    // get the logs
    const table = $("#logs").DataTable({
        columns: [
            { data: "status", width: "3vw" },
            { data: "rating", width: "10vw" },
            { data: "time", width: "15vw" },
            { data: "srcIP", width: "10vw" },
            { data: "url" },
            { data: "response", width: "5vw" }
        ]
    });

    // query to get the latest data
    $.ajax({
        url: "/logs",
        json: true
    }).done(function(logs, status, xhr) {

        // format the logs
        logs.forEach((entry) => {
            entry.time = moment(entry.time).format("M-D-YY H:mm:ss");
        });

        // update the table
        table.clear();
        table.rows.add(logs);
        table.draw();

    }).fail(function(xhr, status, error) {
        alert("fail");
    });


//associated_logs.ajax.url("/associated?apk=" + row.apk + "&ark=" + row.ark).load();

});