self.name = "TommyPay";
self.enabled_methods = [ "tommypay" ];

self.addEventListener('paymentrequest', function(event) {
    event.respondWith(new Promise(function(resolve, reject) {
        window.addEventListener("message", function(event) {
            resolve({
                methodName: "tommypay",
                details: {}
            });
        });

        w = new PaymentWindow();
        w.openUrl("index.html");
    }));
});
