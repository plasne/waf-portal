
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

function query(table) {
    $.ajax({
        url: "/violations",
        json: true
    }).done(function(categories, status, xhr) {

        // clear
        table.clear();

        // separate categories from violations
        const violations = [];
        categories.forEach(function(category) {
            category.violations.forEach(function(violation) {
                violation.category = category.name;
                violations.push(violation);
            });
        });

        // render
        table.rows.add(violations);
        table.draw();

    }).fail(function(xhr, status, error) {
        alert("fail");
    });
}

$(document).ready(function() {

    // get query string parameters
    //const status = getParameterByName("status");

    // define the table
    const table = $("#violations > table").DataTable({
        columns: [
            {
                title: "Name",
                data: "name",
                width: "150px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<div class='indent'>" + data + "</div>";
                    } else {
                        return data;
                    }
                }
            },
            {
                data: "category",
                visible: false
            },
            {
                title: "Mode",
                data: "id",
                width: "100px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "mode";
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "# Events",
                data: "count",
                width: "50px",
                className: "centered"
            },
            {
                title: "Config",
                data: "id",
                width: "100px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "config";
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "Analyze",
                data: "id",
                width: "100px",
                render: function(data, type, row) {
                    if (type === "display") {
                        return "analyze";
                    } else {
                        return data;
                    }
                }
            }
        ],
        "order": [[ 1, 'asc' ]],
        pageLength: 100,
        drawCallback: function(settings) {
            let api = this.api();
            let rows = api.rows( { page: "current" } ).nodes();
            let last = null;
            api.column(1, { page: "current" }).data().each(function(group, i) {
                if (last !== group) {
                    $(rows).eq(i).before("<tr class='group'><td colspan='5'>" + group + "</td></tr>");
                    last = group;
                }
            });
        }
    });

    // query with the defaults
    query(table);

});