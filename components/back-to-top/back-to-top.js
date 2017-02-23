/*jshint browser: true */
(function () {
    "use strict";
    var component = document.getElementById("back-to-top");
    
    document.getElementById("back-to-top").addEventListener("click", smoothscroll);
    function smoothscroll () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo (0,currentScroll - (currentScroll/4));
        }
    }
    function install () {
        component.style.display = "block";
        component.active = true;
    }
    function uninstall () {
        component.style.display = "none";
        component.active = false;
    }
    
    install();
    component.addEventListener("install", install);
    component.addEventListener("uninstall", uninstall);
})();