
function query(table) {
    $.ajax({
        url: "/applications",
        json: true
    }).done(function(applications, status, xhr) {

        // clear
        table.clear();

        // render
        table.rows.add(applications);
        table.draw();

    }).fail(function(xhr, status, error) {
        alert("fail");
    });
}

$(document).ready(function() {

    // define the table
    const table = $("#applications > table").DataTable({
        columns: [
            {
                title: "Application",
                data: "name",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<a target='_blank' href='/visualize.html'>" + data + "</a>";
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "Protection",
                width: "300px",
                className: "centered",
                render: function(data, type, row) {
                    const percentage = Math.round(row.protection.allowed / (row.protection.allowed + row.protection.blocked) * 100);
                    if (type === "display") {
                        return "<div class='" + row.protection.status + "'>" + percentage + "%, " + row.protection.allowed.toPretty(0) + " allowed, " + row.protection.blocked.toPretty("0") + " blocked</div>";
                    } else {
                        return percentage;
                    }
                }
            },
            {
                title: "Availability",
                width: "300px",
                className: "centered",
                render: function(data, type, row) {
                    const percentage = Math.round(row.availability.success / (row.availability.success + row.availability.fail) * 100);
                    if (type === "display") {
                        return "<div class='" + row.availability.status + "'>" + percentage + "%, " + row.availability.success.toPretty(0) + " success, " + row.availability.fail.toPretty("0") + " failed</div>";
                    } else {
                        return percentage;
                    }
                }
            },
            {
                title: "Response",
                width: "120px",
                className: "centered",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<div class='" + row.response.status + "'>" + row.response.avg + " ms</div>";
                    } else {
                        return row.response.avg;
                    }
                }
            }
        ],
        "order": [[ 0, 'asc' ]],
        pageLength: 100
    });

    // query with the defaults
    query(table);

});