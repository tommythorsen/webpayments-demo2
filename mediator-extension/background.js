"use strict";

function PaymentAppGlobalScope(url, code) {
    var self = this;
    self.name = url.substring(url.lastIndexOf('/') + 1);
    self.start_url = url;
    self.enabled_methods = [];
    self.eventListeners = {};
    self.addEventListener = function(name, func) {
        self.eventListeners[name] = func;
    }
    eval(code);
}

function register(url, sendResponse) {
    console.log("register: " + url);
    fetch(url).then(function(response) {
        return response.text();
    }).then(function(text) {
        var paymentApp = new PaymentAppGlobalScope(url, text);
        var entry = {}
        entry[url] = paymentApp;
        chrome.storage.local.set(entry);
        alert("Payment App " + url + " installed");
    });
    sendResponse({to: "webpayments-polyfill.js", result: true});
}

function paymentRequest(request, sendResponse) {
    console.log("paymentRequest: " + request);
    // TODO: Handle the case where there is already a pending request
    pendingPaymentRequest = JSON.parse(request);
    pendingResponseCallback = sendResponse;
    var identifiers = "";
    for (var methodData of pendingPaymentRequest.methodData) {
        for (var supportedMethod of methodData.supportedMethods) {
            if (identifiers) identifiers += ",";
            identifiers += supportedMethod;
        }
    }
    var url = "select-payment-app.html";
    if (identifiers) {
        url += "?ids=" + identifiers;
    }
    chrome.tabs.create({url: url, active: false}, function(tab) {
        paymentTab = tab;
        chrome.windows.create(
                {
                    tabId: tab.id,
                    type: 'popup',
                    focused: true,
                    width: 400,
                    height: 800
                });
    });
    return true;
}


// Message listener for receiving messages from the polyfill functions via
// content.js.
//
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command == "register") {
        return register(message.param, sendResponse);
    } else if (message.command == "paymentrequest") {
        return paymentRequest(message.param, sendResponse);
    } else {
        sendResponse({to: "webpayments-polyfill.js", error: "Unknown command: " + message.command});
    }
});
