/*global $ajax*/
/*jshint browser: true */

(function (external) {
    "use strict";
    var id = "nav-bar";
    var css;
    var html;
    var componentI = {};
    
    var body = document.getElementsByTagName("body")[0];
    var head = document.getElementsByTagName("head")[0];
    var wrapper = document.getElementById("wrapper");
    
    var navSpace = document.createElement("div");
        navSpace.id = "nav-space";
    
    var socialStatus = new MenuStatus (),
        settingsStatus = new MenuStatus ();
    
    var content, logo, title, name, mode, menu, about, socialMenu, socialItems, settingsMenu, settingsItems;
    
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
        content = document.getElementById("nb-content");
        logo = document.getElementById("nb-logo");
        title = document.getElementById("nb-title");
        name = document.getElementById("nb-name");
        mode = document.getElementById("nb-mode");
        menu = document.getElementById("nb-menu");
        about = document.getElementById("nb-about");
        socialMenu = document.getElementById("nb-social");
        socialItems = document.getElementsByClassName("nb-social-item");
        socialStatus = new MenuStatus ();
        settingsMenu = document.getElementById("nb-settings");
        settingsItems = document.getElementsByClassName("nb-settings-item");
        settingsStatus = new MenuStatus ();
        
        logo.addEventListener("click", function () {
            external.ajaxRefreshWith("/index.json")
        });
        name.addEventListener("click", function () {
            external.ajaxRefreshWith("/index.json")
        });
        about.addEventListener("click", function () {
            external.ajaxRefreshWith("/about.json")
        });
        socialMenu.addEventListener("click", function () {
            toggleMenu(socialItems, socialStatus);
        });
        settingsMenu.addEventListener("click", function () {
            toggleMenu(settingsItems, settingsStatus);
        });
        wrapper.addEventListener("click", function () {
            hideMenu(socialItems, socialStatus);
        });
        wrapper.addEventListener("touchstart", function () {
            hideMenu(socialItems, socialStatus);
        });
        
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
            wrapper.insertBefore(navSpace, wrapper.firstChild);
            window.onscroll = checkScroll;
            html.style.display = "block";
            window.console.log("%c" + id + "> Component Installed", "color: green");
            componentI.isActive = true;
        }
    }
    function uninstall () {
        if (componentI.isActive) {
            wrapper.removeChild(navSpace);
            html.style.display = "none";
            window.console.log("%c" + id +"> Component Uninstalled", "color: green");
            componentI.isActive = false;
        }
    }
    
    function MenuStatus () {
        this.isAnimating = false;
        this.isShown = false;
    }
    function showMenu (items, status) {
        if (status.isAnimating || status.isShown) return;
        status.isAnimating = true;
        var count = 0,
            timer = window.setInterval(function () {
                items[count].classList.toggle("nb-item-shown");
                count ++;
                if (count === items.length) {
                    window.clearInterval(timer);
                    status.isShown = true;
                    status.isAnimating = false;
                }
            }, 100);
    }
    function hideMenu (items, status) {
        if (status.isAnimating || !status.isShown) return;
        status.isAnimating = true;
        var count = items.length - 1,
            timer = window.setInterval(function () {
                items[count].classList.toggle("nb-item-shown");
                count --;
                if (count === -1) {
                    window.clearInterval(timer);
                    status.isShown = false;
                    status.isAnimating = false;
                }
            }, 100);
    }
    function toggleMenu (items, status) {
        if (status.isShown) {
            hideMenu(items, status);
        } else {
            showMenu(items, status);
        }
    }
    var lastPos = 0;
    var isHidden = false;
    
    function checkScroll () {
        if (document.body.scrollTop > html.offsetHeight && document.body.scrollTop > lastPos + 5) {
            if (!isHidden) {
                title.classList.add("hidden-nb-content");
                menu.classList.add("hidden-nb-content");
                html.classList.add("hidden-nb");
                hideMenu(socialItems, socialStatus);
                isHidden = true;
            }
        } else if (document.body.scrollTop < lastPos - 5){
            if (isHidden) {
                title.classList.remove("hidden-nb-content");
                menu.classList.remove("hidden-nb-content");
                html.classList.remove("hidden-nb");
                isHidden = false;
            }
        }
        lastPos = document.body.scrollTop;
    }
})(window);