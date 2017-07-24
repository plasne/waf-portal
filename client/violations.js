
function mode(button) {

    // get selection and id
    const bid = button.id.split("-");
    const selection = bid[1];
    const id = bid[2];

    // NOTE: in a real interface you would post the change

    // flip the state of the buttons
    $(button).siblings().removeClass("selected").addClass("unselected");
    $(button).removeClass("unselected").addClass("selected");

}

function lookup(id) {
    const now = new Date().getTime();
    const oneWeekBack = now - (7 * 24 * 60 * 60 * 1000);
    window.open("/logs.html?violations=" + id + "&from=" + oneWeekBack + "&to=" + now, "_blank");
}

function query(table, search) {
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

        // search for a specific set of violations
        if (search) table.search(search).draw();

    }).fail(function(xhr, status, error) {
        alert("fail");
    });
}

$(document).ready(function() {

    // get query string parameters
    let violations = getParameterByName("violations");
    let search = getParameterByName("search")
    if (violations) {
        violations = violations.toString().toArrayOfStrings();
        if (!search) search = "{set}";
    }

    // define the table
    const table = $("#violations > table").DataTable({
        columns: [
            {
                title: "Violation",
                data: "name",
                orderable: false,
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
                title: "Search Set",
                data: "id",
                render: function(data, type, row) {
                    if ( violations && violations.filter(function(id) { return (id == data); }) > 0 ) { // so the matching could be type indifferent
                        return "{set}";
                    } else {
                        return "";
                    }
                },
                visible: false
            },
            {
                title: "Mode",
                data: "mode",
                width: "200px",
                className: "centered",
                orderable: false,
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<div class='radio'>" +
                            "<input id='mode-off-" + row.id + "' class='" + ((data === "off") ? "selected" : "unselected") + "' type='button' value='off' onclick='mode(this)' />" +
                            "<input id='mode-learn-" + row.id + "' class='" + ((data === "learn") ? "selected" : "unselected") + "' type='button' value='learn' onclick='mode(this)' />" +
                            "<input id='mode-block-" + row.id + "' class='" + ((data === "block") ? "selected" : "unselected") + "' type='button' value='block' onclick='mode(this)' />" +
                            "</div>";
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "# Events",
                data: "count",
                width: "80px",
                className: "centered",
                orderable: false
            },
            {
                title: "Config",
                data: "id",
                width: "80px",
                className: "centered",
                orderable: false,
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<input id='config-" + row.id + "' type='button' value='config' disabled />";
                    } else {
                        return data;
                    }
                }
            },
            {
                title: "Instances",
                data: "id",
                width: "80px",
                className: "centered",
                orderable: false,
                render: function(data, type, row) {
                    if (type === "display") {
                        return "<input id='instances-" + row.id + "' type='button' value='lookup' onclick='lookup(\"" + row.id + "\")' />";
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

    // fix Edge bug where the page options aren't shown
    const pageLengthOptions = $("select[name='DataTables_Table_0_length']");
    const countOfPageLengthOptions = $(pageLengthOptions).children().length;
    if (countOfPageLengthOptions < 1) {
        $("<option />").val(10).text(10).appendTo(pageLengthOptions);
        $("<option />").val(25).text(25).appendTo(pageLengthOptions);
        $("<option />").val(50).text(50).appendTo(pageLengthOptions);
        $("<option />").val(100).text(100).appendTo(pageLengthOptions);
    }

    // query with the defaults
    query(table, search);

});