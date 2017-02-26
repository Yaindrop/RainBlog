/*jshint browser: true */
(function (external) {
    "use strict";
    var name = "back-to-top";
    var component = {};
    var css;
    var html;
    
    var body = document.getElementsByTagName("body")[0];
    var head = document.getElementsByTagName("head")[0];
    
    function load () {
        css = document.createElement("link");
        css.href = "\/components\/" + name + "\/" + name + ".css";
        css.type = "text/css";
        css.rel = "stylesheet";
        head.appendChild(css);
        window.console.log("%c" + name +"> Component CSS Loaded:", "color: green");
        
        $ajax.sendGetRequest("\/components\/" + name + "\/" + name + ".html", function (request) {
            html = parseStringToElement(request);
            body.appendChild(html);
            window.console.log("%c" + name +"> Component HTML Loaded:", "color: green");
            setTimeout(function () {
                initialize();  
            },0);
        });
    }
    function initialize () {
        html.addEventListener("click", smoothscroll);
        component.install = install;
        component.uninstall = uninstall;
        install();
    }
    function install () {
        external[name] = component;
        window.console.log("%c" + name +"> Component Installed", "color: green");
    }
    function uninstall () {
        delete external[name];
        css.parentNode.removeChild(css);
        html.innerHTML = "";
        html.parentNode.removeChild(html);
        window.console.log("%c" + name +"> Component Uninstalled", "color: green");
    }
    
    function smoothscroll () {
        var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
            window.requestAnimationFrame(smoothscroll);
            window.scrollTo (0,currentScroll - (currentScroll/4));
        }
    }
    
    load ();
})(window);