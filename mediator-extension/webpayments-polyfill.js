"use strict";

// This file implements the Web Payments javascript API, which consists of
// the PaymentRequest constructor plus a set of functions under
// navigator.payments. This script is injected into all loaded documents
// by content.js.

navigator.paymentApp = {
    // This function installs a payment app in the payment mediator. It is
    // defined here:
    //
    //  https://w3c.github.io/webpayments/proposals/paymentapps/payment-apps.html#registerpaymentapp
    //
    register: function(url) {
        console.log("navigator.paymentApp.register() called");
        var a = document.createElement("a");
        a.href = url;
        sendMessage("register", a.href);
    },
}

// Internal helper function for passing messages to background.js
var sendMessage = function(command, param, callback) {
    if (callback) {
        window.addEventListener("message", function(event) {
            if (!event.data.to || (event.data.to != "webpayments-polyfill.js")) return;
            callback(event.data);
        }, false);
    }
    window.postMessage({to: "background.js", command: command, param: param}, "*");
}

