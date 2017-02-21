/*global window*/
(function (window) {
    "use strict";
    var ajax = {};
    ajax.LoadedEvent = document.createEvent('HTMLEvents');
                    ajax.LoadedEvent.initEvent('ajaxloaded', false, false);
    
    function getRequestObject() {
        //Check whether XMLHttpRequest exists.
        if (window.XMLHttpRequest) {
            return (new XMLHttpRequest());
        } else {
            window.alert("Ajax is not supported!");
            return null;
        }
    }
    
    
    function handleResponse(request, responseHandler, isJsonResponse) {
        if ((request.readyState === 4) && (request.status === 200)) {
            //When isJsonResponse is undefined, ignore this.
            if (isJsonResponse) {
                responseHandler(JSON.parse(request.responseText));
            } else {
                responseHandler(request.responseText);
            }
        }
    }
    ajax.sendGetRequest = function (requestUrl, responseHandler, isJsonResponse) {
        var request = getRequestObject();
        request.onreadystatechange = function () {
            handleResponse(request, responseHandler, isJsonResponse);
        };
        request.open("GET", requestUrl, true);
        request.send(null); // for POST only
    };
    window.$ajax = ajax;
})(window);