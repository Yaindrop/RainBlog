/* global $ajax*/
/* jshint browser: true */
document.addEventListener("DOMContentLoaded", function (event) {
    var head = document.getElementsByTagName("head")[0];
    var body = document.getElementsByTagName("body")[0];
    var wrapper = document.getElementById("wrapper");
    
    var page;
    
    var frameString;
    var frame;
    
    var contents = {};
    var contentCSSName = [];
    
    window.components = {};
    
    var isLoadingContents = false;
    var isLoadingComponents = false;
        
    ajaxRefreshWith(document.getElementsByTagName("title")[0].dataset.json);
    
//    var delay1 = setTimeout(function () {
//        ajaxRefreshWith("/tags/tag1.json");
//        var delay2 = setTimeout(function () {
//            ajaxRefreshWith("/tags/tag2.json");
//        },4000);
//    },4000);
    
    window.parseStringToElement = function (html) {
        var XMLWrapper = (new DOMParser()).parseFromString("", "text/html").getElementsByTagName("body")[0];
        XMLWrapper.innerHTML = html;
        return XMLWrapper.firstChild;
    };
    
    window.ajaxRefreshWith = ajaxRefreshWith;
    function ajaxRefreshWith (jsonURI) {
        if (isLoadingComponents || isLoadingComponents) {
            window.console.log("%cPage> Error: Previous loading hasn't finished", "color: red");
        } else {
            $ajax.sendGetRequest(jsonURI, function (request) {
                page = request;
                window.console.log("%cAJAX> Page JSON Loaded, URI: " + jsonURI, "color: darkcyan");
                var htmlURI = jsonURI.substring(0, jsonURI.indexOf(".")) + ".html";
                window.history.pushState({url: htmlURI, json: jsonURI}, 0, htmlURI);
                page.contents = [];
                for (var i = 0; i < page.subframes.length; i ++) {
                    page.contents = page.contents.concat(page[page.subframes[i]]);
                }
                
                loadPage ();
            }, true);
        }
    }
    window.addEventListener("popstate", function(e) {
        if (history.state){
            if (isLoadingComponents || isLoadingComponents) {
                window.console.log("%cPage> Error: Previous loading hasn't finished", "color: red");
                history.forward(1);
            } else {
                var jsonURI = e.state.json;
                $ajax.sendGetRequest(jsonURI, function (request) {
                    page = request;
                    window.console.log("%cAJAX> Page JSON Loaded, URI: " + jsonURI, "color: darkcyan");
                    var htmlURI = jsonURI.substring(0, jsonURI.indexOf(".")) + ".html";
                    window.history.replaceState({url: htmlURI, json: jsonURI}, 0, htmlURI);
                    page.contents = [];
                    for (var i = 0; i < page.subframes.length; i ++) {
                        page.contents = page.contents.concat(page[page.subframes[i]]);
                    }

                    loadPage ();
                }, true);
            }
        }
    }, false);
    
    function loadPage () {
        window.console.log("%cPage> Loading Start", "color: orange");
        document.getElementsByTagName("title")[0].innerHTML = page.title;
        
        loadContents();
        loadComponents();
    }
    
    
    function loadComponents () {
        if (isLoadingComponents) {
            window.console.log("%cComponents> Error: Previous loading hasn't finished", "color: red");
            return;
        } else {
            window.console.log("%cComponents> Now Loading", "color: purple");
            isLoadingComponents = true;
        }
        var loadQueue = [],
            installQueue = [],
            uninstallQueue = [];
        //Initialize Load Queue
        for (var i = 0; i < page.components.length; i ++) {
            if (!(page.components[i] in window.components)) {
                loadQueue.push(page.components[i]);
            }
        }
        if (loadQueue.length !== 0) { 
            window.console.log("%cComponents> Load: " + loadQueue, "color: purple");
        } else {
            window.console.log("%cComponents> Nothing to Load", "color: green");
        }
        //Initialize Install Queue
        for (id in window.components) {
            if (!window.components[id].isActive && (page.components.indexOf(id) !== -1)) {
                installQueue.push(id);
            }
        }
        if (installQueue.length !== 0) { 
            window.console.log("%cComponents> Install: " + installQueue, "color: purple");
        } else {
            window.console.log("%cComponents> Nothing to Install", "color: green");
        }
        //Initialize Uninstall Queue
        for (id in window.components) {
            if (window.components[id].isActive && (page.components.indexOf(id) === -1)) {
                uninstallQueue.push(id);
            }
        }
        if (uninstallQueue.length !== 0) { 
            window.console.log("%cComponents> Uninstall: " + uninstallQueue, "color: purple");
        } else {
            window.console.log("%cComponents> Nothing to Uninstall", "color: green");
        }
        //Run Load Queue
        for (var i = 0; i < loadQueue.length; i ++) {
            var js = document.createElement("script");
                js.src = "\/components\/" + loadQueue[i] + ".js";
                js.type = "text/javascript";
                head.appendChild(js);
        }
        //Run Install Queue
        for (var i = 0; i < installQueue.length; i ++) {
            window.components[installQueue[i]].install ();
        }
        //Run Uninstall Queue
        for (var i = 0; i < uninstallQueue.length; i ++) {
            window.components[uninstallQueue[i]].uninstall ();
        }
        isLoadingComponents = false;
        
        checkPage ();
    } 
    
    function loadContents () {
        if (isLoadingContents) {
            window.console.log("%cContents> Error: Previous loading hasn't finished", "color: red");
            return;
        } else {
            isLoadingContents = true;
            window.console.log("%cContents> Now Loading", "color: purple");
            
            loadFrame ();
        }
    }
    function loadFrame () {
        if (frame) {
            frame.innerHTML = "";
            wrapper.removeChild(frame);
        }
        if (frame && page.frame === frame.id) {
            frame = parseStringToElement(frameString);
            wrapper.appendChild(frame);
            
            loadContentElements ();
        } else {
            $ajax.sendGetRequest("\/frames\/" + page.frame + ".html", function (request) {
                frameString = request;
                frame = parseStringToElement(request);
                wrapper.appendChild(frame);
                
                loadContentElements ();
            });
        }
    }
    function loadContentElements () {
        var addQueue = [];
        var removeQueue = [];
        var adding = false;
        var removing = false;
        var count = 0;
        for (var i = 0; i < page.contents.length; i ++) {
            if (!(page.contents[i] in contents)) addQueue.push(page.contents[i]);
        }
        if (addQueue.length !== 0) { 
            window.console.log("%cContents> Add: " + addQueue, "color: purple");
        } else {
            window.console.log("%cContents> Nothing to Add", "color: green");
        }
        for (id in contents) {
            if (page.contents.indexOf(id) === -1) removeQueue.push(id);
        }
        if (removeQueue.length !== 0) { 
            window.console.log("%cContents> Remove: " + removeQueue, "color: purple");
        } else {
            window.console.log("%cContents> Nothing to Remove", "color: green");
        }
        for (var j = 0; j < addQueue.length; j ++) {
            adding = true;
            $ajax.sendGetRequest("\/contents\/" + addQueue[j] + ".html", function (request) {
                var html = parseStringToElement(request);
                contents[html.id] = html;
                if (contentCSSName.indexOf(html.dataset.css) === -1) {
                    var css = document.createElement("link");
                    css.href = html.dataset.css;
                    css.type = "text/css";
                    css.rel = "stylesheet";
                    head.appendChild(css);
                    contentCSSName.push(html.dataset.css);
                }
                
                count ++;
                if (count === addQueue.length) {
                    adding = false;
                    
                    if (!removing) appendContents ();
                }
            });
        }
        for (var j = 0; j < removeQueue.length; j ++) {
            removing = true;
            delete contents[removeQueue[j]];
        }
        removing = false;
        
        if (!adding) appendContents ();
    }
    function appendContents () {
        for (var i = 0; i < page.subframes.length; i ++) {
            subframe = document.getElementById(page.subframes[i]);
            framecontents = page[page.subframes[i]];
            for (var j = 0; j < framecontents.length; j ++) {
                var html = contents[framecontents[j]];
                subframe.appendChild(html);
                scripts = html.getElementsByTagName("script");
                if (scripts.length > 0) {
                    for (var k = 0; k < scripts.length; k ++) {
                        eval(scripts[k].innerHTML);
                    }
                }
            }
        }
        isLoadingContents = false;
        
        checkPage ();
    }
    
    function checkPage () {
        if (!isLoadingContents && !isLoadingComponents) {
            window.console.log("%cPage> Loading Finished", "color: orange");
        }
    }
});