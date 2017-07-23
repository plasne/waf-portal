
String.prototype.toArrayOfStrings = function() {
    console.log(this);
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

Number.prototype.toPretty = function(digits) {
    if (this > 1000000) {
        return (this / 1000000).toFixed(digits) + "M";
    } else if (this > 1000) {
        return (this / 1000).toFixed(digits) + "K";
    }
    return this;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function() {

    // create menu
    const menu = $("<div />").attr("id", "menu").appendTo("body");
    const menuItem = function(title, link) {
        const div = $("<div />").click(function() {
            window.open(link, "_self");
        });
        $("<span />").text(title).appendTo(div);
        return div;
    };
    menuItem("Visualize", "/visualize.html").appendTo(menu);
    menuItem("Logs", "/logs.html").appendTo(menu);
    menuItem("Violations", "/violations.html").addClass("menu-sep").appendTo(menu);
    menuItem("Logout", "/default.html").appendTo(menu);

    // open or close the menu    
    $("#header .icon").click(function() {
        $(menu).toggle();
    });

    // collapse the menu if anything else is clicked
    $("body").click(function(evt) {
        if (evt.target.id !== "header-icon") {
            if (menu.is(":visible")) menu.hide();
        }
    });

});