"use strict";

var pendingPaymentRequest = null;
var pendingResponseCallback = null;
var paymentTab = null;

function PaymentAppGlobalScope(url, code) {
    this.name = url.substring(url.lastIndexOf('/') + 1);
    this.start_url = url;
    this.code = code;
    this.enabled_methods = [];
    this.eventListeners = {};
    this.addEventListener = function(name, func) {
        this.eventListeners[name] = func;
    }

    var self = this;
    eval(code);

    this.getEventListener = function(name) {
        return this.eventListeners[name];
    }
}

function register(url, sendResponse) {
    console.log("register: " + url);
    fetch(url).then(function(response) {
        return response.text();
    }).then(function(text) {
        var scope = new PaymentAppGlobalScope(url, text);
        var entry = {}
        entry[url] = scope;
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

function onPaymentAppSelected(paymentApp, sendResponse) {
    if (paymentTab) {
        chrome.tabs.remove(paymentTab.id);
        paymentTab = null;
    }

    var scope = new PaymentAppGlobalScope(paymentApp.start_url, paymentApp.code);
    var eventListener = scope.getEventListener('paymentrequest');
    if (eventListener) {
        eventListener({
            request: pendingPaymentRequest,
            respondWith: function(response) {
                pendingResponseCallback({
                    to: "webpayments-polyfill.js",
                    response: response
                });
                pendingPaymentRequest = null;
                pendingResponseCallback = null;
            }
        });
    }

    sendResponse({to: "webpayments-polyfill.js", result: true});
}

// Message listener for receiving messages from the polyfill functions via
// content.js.
//
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command == "register") {
        return register(message.param, sendResponse);
    } else if (message.command == "paymentrequest") {
        return paymentRequest(message.param, sendResponse);
    } else if (message.command == "onpaymentappselected") {
        return onPaymentAppSelected(message.param, sendResponse);
    } else {
        sendResponse({to: "webpayments-polyfill.js", error: "Unknown command: " + message.command});
    }
});
