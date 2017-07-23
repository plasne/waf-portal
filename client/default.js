
$(document).ready(function() {

    // scroll to top of page
    $(".footer > div:first > div:last").click(function() {
        $("html, body").animate({ scrollTop: 0 }, "fast");
    });

});