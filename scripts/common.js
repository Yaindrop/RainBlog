/* global $ajax*/
/* jshint browser: true */
document.addEventListener("DOMContentLoaded", function (event) {
    var head = document.getElementsByTagName("head")[0];
    var body = document.getElementsByTagName("body")[0];
    var ContentWrapper = document.createElement("div");
        ContentWrapper.id = "content-wrapper";
        body.appendChild(ContentWrapper);
    //Every page has a corresponding JSON file that describes the components and contents the page should contain
    var PageJSON;
    /*
    Arrays below store loaded Components and Contents with their names in string.
    Components and Contents won't be removed from the DOM once they are loaded.
    They can only be inactivated when not on the screen.
    */
    var loadedComponents = [],
        loadedContents = [];
    /*
    Arrays below store loaded CSS/JS files used by Contents.
    Different Contents are allowed to share one CSS/JS file.
    When Contents are being loaded, common CSS/JS file will only be loaded once.
     */
    var loadedCSS = [],
        loadedJS = [];
    //Indicates whether components or contents are loaded
    var ComponentLoaded = true,
        ContentLoaded = true;
    //Initialize page with JSON file pointed by the url stored in the title tag.
    ajaxRefreshWith(document.getElementsByTagName("title")[0].dataset.json);
    
    //just for test
    var delay1 = setTimeout(function () {
        ajaxRefreshWith("/tags/tag1.json");
        var delay2 = setTimeout(function () {
            ajaxRefreshWith("/tags/tag2.json");
        },4000);
    },4000);
    
    function ajaxRefreshWith (json) {
        if (ComponentLoaded && ContentLoaded) {
            //Fetch the requested JSON file, then call the body
            $ajax.sendGetRequest(json, function (request) {
                PageJSON = request;
                window.console.log("%cAJAX> Page JSON Loaded, URI: " + json, "color: darkcyan");
                var htmlURI = json.substring(0, json.indexOf(".")) + ".html";
                window.history.pushState({}, 0, htmlURI);
                body.dispatchEvent($ajax.makeEvent("jsonloaded"));
            }, true);
        } else {
            window.console.log("%cAJAX> Error: Previous loading hasn't finished", "color: red");
        }
    }
    body.addEventListener("ajaxfinished", function (e) {
        //If a new JSON file is loaded, load components and contents.
        if (e.message === "jsonloaded") {
            window.console.log("%cBody> Start Page Loading", "color: orange");
            document.getElementsByTagName("title")[0].innerHTML = PageJSON.title;
            ComponentLoaded = false;
            ContentLoaded = false;
            loadComponents();
            loadContents();
        }
        //If components loading finished, activate components on the screen.
        if (e.message === "componentloaded") {
            if (!isAddingComponents && !isRemovingComponents) {
                window.console.log("%cComponents> Loading Finished", "color: green");
                for (var i = 0; i < PageJSON.components.length; i ++) {
                    var component = document.getElementById(PageJSON.components[i]);
                    if (!component.active) component.dispatchEvent(new Event("install"));
                }
                ComponentLoaded = true;
                body.dispatchEvent(new Event("refreshfinished"));
            }
        }
        //If contents loading finished, sort contents on the screen.
        if (e.message === "contentloaded") {
            if (!isAddingContents && !isRemovingContents) {
                sortContents();
            }
        }
    });
    body.addEventListener("refreshfinished", function () {
        if (ComponentLoaded && ContentLoaded) {
            window.console.log("%cBody> Page Loading Finished", "color: orange");
        }
    });
    function sortContents () {
        var deviation = [];
        for (var i = 0; i < PageJSON.contents.length; i ++) {
            deviation.push(Math.abs(loadedContents.indexOf(PageJSON.contents[i]) - i));
        }
        var swap = {first: 0, firstindex: -1, second: 0, secondindex: -1,};
        for (var i = 0; i < deviation.length; i ++) {
            if (deviation[i] > swap.first) {
                swap.first = deviation[i];
                swap.firstindex = i;
            } else if (deviation[i] > swap.second) {
                swap.second = deviation[i];
                swap.secondindex = i;
            }
        }
        window.console.log("%cContents Sort> Deviation: " + deviation, "color: purple");
        if (swap.first === 0 && swap.second === 0) {
            window.console.log("%cContents Sort> Finished", "color: green");
            ContentLoaded = true;
            body.dispatchEvent(new Event("refreshfinished"));
        } else {
            var a = document.getElementById(loadedContents[Math.min(swap.firstindex, swap.secondindex)]),
                b = document.getElementById(loadedContents[Math.max(swap.firstindex, swap.secondindex)]);
            if (Math.abs(swap.firstindex - swap.secondindex) === 1) {
                ContentWrapper.insertBefore(b, a);
            } else {
                var temp = b.previousElementSibling;
                ContentWrapper.insertBefore(b, a);
                if (temp.nextElementSibling) {
                    ContentWrapper.insertBefore(a, temp.nextElementSibling);
                } else {
                    a.parentNode.appendChild(a);
                }
            }
            temp = loadedContents[swap.firstindex];
            loadedContents[swap.firstindex] = loadedContents[swap.secondindex];
            loadedContents[swap.secondindex] = temp;
            sortContents();
        }
    }
    var isAddingComponents = false;
    var isRemovingComponents = false;
    function loadComponents () {
        if (isAddingComponents || isRemovingComponents) {
            window.console.log("%cComponents> Error: Previous loading hasn't finished", "color: red");
            return;
        } else {
            isAddingComponents = true;
            isRemovingComponents = true;
            window.console.log("%cComponents> Now Loading", "color: purple");
        }
        var addQueue = [],
            removeQueue = [],
            count = 0;
        //Initialize Add Queue
        //If a component requested by JSON doesn't exists in loadedComponents, add it to Add Queue.
        for (var i = 0; i < PageJSON.components.length; i ++) {
            if (loadedComponents.indexOf(PageJSON.components[i]) === -1) {
                addQueue.push(PageJSON.components[i]);
            }
        }
        if (addQueue.length !== 0) { 
            window.console.log("%cComponents> Add: " + addQueue, "color: purple");
        } else {
            window.console.log("%cComponents> Nothing to Add", "color: green");
            isAddingComponents = false;
        }
        //Initialize Remove Queue
        //If a component not requested by JSON is active, add it to Remove Queue
        for (var i = 0; i < loadedComponents.length; i ++) {
            if (!PageJSON.components.includes(loadedComponents[i]) && document.getElementById(loadedComponents[i]).active) {
                removeQueue.push(loadedComponents[i]);
            }
        }
        if (removeQueue.length !== 0) { 
            window.console.log("%cComponents> Remove: " + removeQueue, "color: purple");
        } else {
            window.console.log("%cComponents> Nothing to Remove", "color: green");
            isRemovingComponents = false;
        }
        //Run Add Queue
        for (var i = 0; i < addQueue.length; i ++) {
            //Directly insert CSS from /components/[ComponentID]/[ComponentID].css
            var css = document.createElement("link");
            css.href = "\/components\/" + addQueue[i] + "\/" + addQueue[i] + ".css";
            css.type = "text/css";
            css.rel = "stylesheet";
            head.appendChild(css);
            //Send AJAX requests for HTML
            $ajax.sendGetRequest("\/components\/" + addQueue[i] + "\/" + addQueue[i] + ".html", function (request) {
                //Parse returned HTML to div element, and append to body
                //Note: The order is determined by the returning order of the AJXA requests.
                var html = parseStringToDivElement(request);
                body.appendChild(html);
                window.console.log("%cAJAX> Component HTML Loaded:", "color: darkcyan");
                window.console.log(html);
                //Insert JS from /components/[ComponentID]/[ComponentID].js
                var js = document.createElement("script");
                js.component = addQueue[count];
                js.src = "\/components\/" + addQueue[count] + "\/" + addQueue[count] + ".js";
                js.type = "text/javascript";
                head.appendChild(js);
                //Push the ComponentID to the loadedComponents
                loadedComponents.push(html.id);
                window.console.log("%cComponents> Added: " + html.id, "color: green");
                //Count how many AJAX requests have returned
                count ++;
                if (count == addQueue.length) {
                    //When all requests returned, adding finishes
                    isAddingComponents = false;
                    body.dispatchEvent($ajax.makeEvent("componentloaded"));
                }
            });
        }
        
        //Run Remove Queue
        for (var i = 0; i < removeQueue.length; i ++) {
            var component = document.getElementById(removeQueue[i]);
            component.dispatchEvent(new Event("uninstall"));
            /*[Complete Removal]
            //Locate elements by id, then remove
            component.innerHTML = "";
            component.parentNode.removeChild(component);
            //Locate CSS by "component" property, then remove
            var links = document.getElementsByTagName("link");
            for (var j = 0; j < links.length; j ++) {
                if (links[j].component === removeQueue[i]) {
                    links[j].parentNode.removeChild(links[j]);
                }
            }
            //Locate JS by "component" property, then remove
            var scripts = document.getElementsByTagName("script");
            for (var j = 0; j < scripts.length; j ++) {
                if (scripts[j].component === removeQueue[i]) {
                    scripts[j].innerHTML = "";
                    scripts[j].parentNode.removeChild(scripts[j]);
                }
            }
            [End Complete Removal]*/
            window.console.log("%cComponents> Removed: " + removeQueue[i], "color: green");
        }
        isRemovingComponents = false;
        body.dispatchEvent($ajax.makeEvent("componentloaded"));
    } 
    
    var isAddingContents = false, 
        isRemovingContents = false;
    function loadContents () {
        if (isAddingContents || isRemovingContents) {
            window.console.log("%cContents> Error: Previous loading hasn't finished", "color: red");
            return;
        } else {
            isAddingContents = true;
            isRemovingContents = true;
            window.console.log("%cContents> Now Loading", "color: purple");
        }
        var addQueue = [],
            removeQueue = [],
            contentJson = [],
            count = 0;
        //Initialize Add Queue
        //If a content requested by JSON doesn't exists in loadedContents, add it to Add Queue.
        for (var a = 0; a < PageJSON.contents.length; a ++) {
            if (loadedContents.indexOf(PageJSON.contents[a]) === -1) addQueue.push(PageJSON.contents[a]);
        }
        if (addQueue.length !== 0) { 
            window.console.log("%cContents> Add: " + addQueue, "color: purple");
        } else {
            window.console.log("%cContents> Nothing to Add", "color: green");
            isAddingContents = false;
        }
        //Initialize Remove Queue
        //If a content not requested by JSON is loaded, add it to Remove Queue
        for (var i = 0; i < loadedContents.length; i ++) {
            if (!PageJSON.contents.includes(loadedContents[i])) {
                removeQueue.push(loadedContents[i]);
            }
        }
        if (removeQueue.length !== 0) { 
            window.console.log("%cContents> Remove: " + removeQueue, "color: purple");
        } else {
            window.console.log("%cContents> Nothing to Remove", "color: green");
            isRemovingContents = false;
        }
        //Run Add Queue
        for (var i = 0; i < addQueue.length; i ++) {
            var content = addQueue[i];
            //Request content JSON
            $ajax.sendGetRequest("\/contents\/" + content + "\/" + content + ".json", function (request) {
                contentJson.push(request);
                count ++;
                if (count === addQueue.length) {
                    count = 0;
                    for (var j = 0; j < contentJson.length; j ++) {
                        //If requested CSS is not added, add it
                        if (contentJson[j].stylesheet !== null && loadedCSS.indexOf(contentJson[j].stylesheet) === -1) {
                            var css = document.createElement("link");
                            css.href = contentJson[j].stylesheet;
                            css.type = "text/css";
                            css.rel = "stylesheet";
                            head.appendChild(css);
                            loadedCSS.push(contentJson[j].stylesheet);
                        }
                        //Request HTML, then insert JS
                        $ajax.sendGetRequest("\/contents\/" + contentJson[j].name + "\/" + contentJson[j].name + ".html", function (request) {
                            //Parse Returned HTML to Div Element and Add to Waiting Queue
                            var html = parseStringToDivElement(request);
                            ContentWrapper.appendChild(html);
                            window.console.log("%cAJAX> Content HTML Loaded:", "color: darkcyan");
                            window.console.log(html);
                            //If requested JS is not added, add
                            if (contentJson[count].script !== null) {
                                var js = document.createElement("script");
                                js.content = addQueue[count];
                                js.src = contentJson[count].script;
                                js.type = "text/javascript";
                                head.appendChild(js);
                            }
                            
                            loadedContents.push(html.id);
                            window.console.log("%cContents> Added: " + html.id, "color: green");
                            count ++;
                            
                            if (count === addQueue.length) {
                                isAddingContents = false;
                                body.dispatchEvent($ajax.makeEvent("contentloaded"));
                            }
                        });
                    }
                }
            }, true);
        }
        //Run Remove Queue, CSS and JS won't be removed
        for (var i = 0; i < removeQueue.length; i ++) {
            var content = document.getElementById(removeQueue[i]);
            content.innerHTML = "";
            content.parentNode.removeChild(content);
            loadedContents.splice(loadedContents.indexOf(removeQueue[i]), 1);
            
            window.console.log("%cContents> Removed: " + removeQueue[i], "color: green");
        }
        isRemovingContents = false;
        body.dispatchEvent($ajax.makeEvent("contentloaded"));
    }
    function parseStringToDivElement (htmlString) {
        var XMLWrapper = (new DOMParser()).parseFromString("", "text/html").getElementsByTagName("body")[0];
        XMLWrapper.innerHTML = htmlString;
        return XMLWrapper.getElementsByTagName("div")[0];
    }
});