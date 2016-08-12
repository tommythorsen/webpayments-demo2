"use strict";

function PaymentAppGlobalScope(url, code) {
    this.url = url;
    this.code = code;
    this.self = this;
    console.log("EVAL:");
    eval(code);
}

function register(url, sendResponse) {
    console.log("register: " + url);
    fetch(url).then(function(response) {
        return response.text();
    }).then(function(text) {
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
