/*jshint browser: true */

(function (external) {
    "use strict";
    var id = "back-to-top";
    var css;
    var html;
    var componentI = {};
    
    var body = document.getElementsByTagName("body")[0];
    var head = document.getElementsByTagName("head")[0];
    
    load ();
    function load () {
        css = document.createElement("link");
        css.href = "\/components\/" + id + "\/" + id + ".css";
        css.type = "text/css";
        css.rel = "stylesheet";
        head.appendChild(css);
        window.console.log("%c" + id +"> Component CSS Loaded", "color: green");
        
        $ajax.sendGetRequest("\/components\/" + id + "\/" + id + ".html", function (request) {
            html = parseStringToElement(request);
            body.appendChild(html);
            window.console.log("%c" + id +"> Component HTML Loaded", "color: green");
            
            initialize();  
        });
    }
    function initialize () {
        html.addEventListener("click", smoothscroll);
        
        makeInterface ();
    }
    function makeInterface () {
        componentI.install = install;
        componentI.uninstall = uninstall;
        componentI.isActive = false;
        external.components[id] = componentI;
        
        install();
    }
    function install () {
        if (!componentI.isActive) {
            html.style.display = "block";
            window.console.log("%c" + id +"> Component Installed", "color: green");
            componentI.isActive = true;
        }
    }
    function uninstall () {
        if (componentI.isActive) {
            html.style.display = "none";
            window.console.log("%c" + id +"> Component Uninstalled", "color: green");
            componentI.isActive = false;
        }
    }
    
    function smoothscroll () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo (0,currentScroll - (currentScroll/4));
        }
    }
})(window);