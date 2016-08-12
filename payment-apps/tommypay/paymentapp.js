self.name = "TommyPay";
self.enabled_methods = [ "tommypay" ];

self.addEventListener('paymentrequest', function(event) {
    event.respondWith({
        methodName: "tommypay",
        details: {}
    });
});
