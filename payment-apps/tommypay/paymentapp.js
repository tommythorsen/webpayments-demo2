self.name = "TommyPay";
self.enabled_methods = [ "tommypay" ];

self.addEventListener('paymentrequest', function(event) {
    console.log("onpaymentrequest");
    event.respondWith(new Promise(function(resolve, reject) {
        w = new PaymentWindow();
        w.openUrl("index.html")
        .then(function(response) {
            resolve({
                methodName: "tommypay",
                details: {}
            });
        });
    }));
});
