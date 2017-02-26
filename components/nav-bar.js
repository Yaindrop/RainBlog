/*global $ajax*/
/*jshint browser: true */

/*
This script should be put in the root directory of the component and be named the same as the componentID.

Instructions:
    1. This script should run as soon as the component is loaded to the page, so make it a IIFE.
    2. When the uninstall function is called, any external effects made by this script should be inversed.
*/
(function () {
    "use strict";
    var name = "nav-bar";
    var component = {};
    var css;
    var html;
    
    var body = document.getElementsByTagName("body")[0];
    var head = document.getElementsByTagName("head")[0];
    var ContentWrapper = document.getElementById("content-wrapper");
    
    var content, title, menu, socialMenu, socialItems, settingsMenu, settingsItems;
    
    var socialStatus = new MenuStatus ();
    var settingsStatus = new MenuStatus ();
    
    
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
        content = document.getElementById("nb-content");
        title = document.getElementById("nb-title");
        menu = document.getElementById("nb-menu");
        socialMenu = document.getElementById("nb-social");
        socialItems = document.getElementsByClassName("nb-social-item");
        socialStatus = new MenuStatus ();
        settingsMenu = document.getElementById("nb-settings");
        settingsItems = document.getElementsByClassName("nb-settings-item");
        settingsStatus = new MenuStatus ();
        
        socialMenu.addEventListener("click", function () {
            toggleMenu(socialItems, socialStatus);
        });
        settingsMenu.addEventListener("click", function () {
            toggleMenu(settingsItems, settingsStatus);
        });
        ContentWrapper.addEventListener("click", function () {
            hideMenu(socialItems, socialStatus);
        });
        ContentWrapper.addEventListener("touchstart", function () {
            hideMenu(socialItems, socialStatus);
        });
        component.install = install;
        component.uninstall = uninstall;
        install();
    }
    function install () {
        ContentWrapper.innerHTML = "<div id=\"nav-space\"></div>" + ContentWrapper.innerHTML;
        window.onscroll = checkScroll;
        external[name] = component;
        window.console.log("%c" + name +"> Component Installed", "color: green");
    }
    function uninstall () {
        ContentWrapper.removeChild(document.getElementById("nav-space"));
        delete external[name];
        css.parentNode.removeChild(css);
        html.innerHTML = "";
        html.parentNode.removeChild(html);
        window.console.log("%c" + name +"> Component Uninstalled", "color: green");
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
        if (document.body.scrollTop > component.offsetHeight && document.body.scrollTop > lastPos + 5) {
            if (!isHidden) {
                title.classList.add("hidden-nb-content");
                menu.classList.add("hidden-nb-content");
                component.classList.add("hidden-nb");
                hideMenu(socialItems, socialStatus);
                isHidden = true;
            }
        } else if (document.body.scrollTop < lastPos - 5){
            if (isHidden) {
                title.classList.remove("hidden-nb-content");
                menu.classList.remove("hidden-nb-content");
                component.classList.remove("hidden-nb");
                isHidden = false;
            }
        }
        lastPos = document.body.scrollTop;
    }
    load ();
})();