/*jshint browser: true */
(function (event) {
    "use strict";
    
    document.getElementById("back-to-top").addEventListener("click", smoothscroll);
    function smoothscroll () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo (0,currentScroll - (currentScroll/4));
        }
    }
})();