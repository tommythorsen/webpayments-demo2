"use strict";

function PaymentAppGlobalScope(url, code) {
    var self = this;
    var name = url.substring(url.lastIndexOf('/') + 1);
    var start_url = url;
    var enabled_methods = [];
    eval(code);
}

function register(url, sendResponse) {
    console.log("register: " + url);
    fetch(url).then(function(response) {
        return response.text();
    }).then(function(text) {
        var paymentApp = new PaymentAppGlobalScope(url, text);
        console.log(paymentApp.name);
        console.log(paymentApp.start_url);
        console.log(paymentApp.enabled_methods);
        var entry = {}
        entry[url] = {
            url: url,
            code: text
        };
        chrome.storage.local.set(entry);
        alert("Payment App " + url + " installed");
    });
    sendResponse({to: "webpayments-polyfill.js", result: true});
}


// Message listener for receiving messages from the polyfill functions via
// content.js.
//
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command == "register") {
        return register(message.param, sendResponse);
    } else {
        sendResponse({to: "webpayments-polyfill.js", error: "Unknown command: " + message.command});
    }
});
