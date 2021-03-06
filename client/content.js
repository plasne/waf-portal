
$(document).ready(function() {

    // variables
    $(".company-name").text("Fabrikam");
    $(".company-url").text("Fabrikam.com");

    // logo
    const logo = $(".logo");
    const svg = $("<svg />").attr({ viewBox: "0 0 100 88" }).appendTo(logo);
    const g = $("<g />").attr({ transform: "translate(0.0, 88.0) scale(0.030, -0.030)", fill: "#000000", stroke: "none" }).appendTo(svg);
    $("<path />").attr({ d: "M1265 2726 c-121 -17 -231 -45 -255 -65 -16 -13 -21 -40 -31 -152 l-12 -136 -86 -50 c-47 -28 -107 -69 -133 -92 -27 -24 -56 -41 -70 -41 -12 1 -75 16 -138 34 -74 22 -121 31 -131 26 -36 -20 -161 -231 -205 -348 -33 -86 -66 -212 -60 -228 3 -7 54 -45 113 -85 59 -40 112 -77 116 -83 4 -6 5 -29 2 -51 -4 -37 4 -137 21 -243 l7 -43 -102 -96 c-55 -52 -101 -100 -101 -106 0 -7 22 -57 49 -112 60 -125 148 -248 246 -345 l75 -74 127 63 128 63 79 -43 c43 -23 111 -54 150 -70 47 -18 75 -35 83 -51 7 -12 23 -72 37 -132 14 -60 29 -113 34 -118 15 -15 115 -28 217 -28 103 0 261 24 367 55 67 19 62 7 77 184 7 69 13 126 14 126 1 1 34 21 72 43 39 23 99 64 133 92 34 27 67 50 73 50 5 0 64 -16 130 -35 67 -19 127 -35 134 -35 19 0 99 116 155 224 59 113 111 262 113 324 l2 47 -112 75 -112 75 -1 90 c0 50 -7 126 -16 170 l-15 80 101 95 c61 57 100 103 100 114 0 29 -66 162 -124 251 -85 129 -212 265 -247 265 -10 0 -70 -25 -133 -57 l-116 -56 -88 46 c-48 25 -114 55 -147 67 -33 13 -65 27 -71 34 -6 6 -23 64 -38 128 -16 64 -33 124 -40 132 -7 10 -42 19 -101 26 -110 12 -154 11 -270 -4z m775 -731 c63 -53 118 -102 123 -110 4 -9 2 -25 -5 -38 -23 -42 -352 -434 -376 -448 -19 -11 -26 -10 -52 9 -16 12 -36 22 -44 22 -15 0 -96 -86 -96 -102 0 -8 52 -60 276 -273 42 -40 54 -66 54 -115 0 -36 -7 -48 -52 -97 -83 -87 -125 -101 -188 -60 -33 21 -144 132 -241 240 -23 26 -48 47 -55 47 -13 0 -126 -131 -173 -200 -14 -19 -42 -50 -63 -69 -38 -34 -40 -34 -66 -19 -46 28 -49 43 -22 94 14 25 41 62 62 82 59 60 168 195 168 209 0 7 -32 47 -72 88 -66 70 -74 75 -102 69 -17 -4 -64 -6 -104 -6 -130 2 -243 77 -304 200 -38 79 -35 272 5 272 6 0 53 -41 104 -92 91 -90 92 -91 122 -79 41 18 131 114 131 142 0 14 -32 54 -90 113 -51 52 -86 96 -82 102 13 21 84 36 145 32 121 -8 237 -86 293 -195 27 -54 29 -66 29 -172 l1 -113 57 -54 c32 -30 64 -54 71 -54 16 0 86 77 86 94 0 6 -19 29 -42 53 -34 34 -40 46 -32 62 5 11 91 119 192 240 137 166 189 221 205 221 13 0 70 -40 137 -95z" }).appendTo(g);
    $(logo).html( logo.html() ); // fix for jQuery to refresh SVG content

    // scroll to top of page
    $(".footer > div:first > div:last").click(function() {
        $("html, body").animate({ scrollTop: 0 }, "fast");
    });

});