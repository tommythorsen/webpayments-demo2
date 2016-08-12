"use strict";

function PaymentAppGlobalScope(url) {
    this.url = url;
}

function register(url, sendResponse) {
    console.log("register: " + url);
    fetch(url).then(function(response) {
        return response.blob();
    }).then(function(blob) {
        console.log(blob);
        var entry = {}
        entry[url] = url;
        chrome.storage.local.set(entry);
        alert("Payment App " + url + " installed");
        sendResponse({to: "webpayments-polyfill.js", result: true});
    });
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
