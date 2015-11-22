(function($){
	chrome.extension.sendRequest({get: "browser_url"}, function(response) {
		$('#qr').qrcode({
			width: 260,
			height: 260,
			text: response.url
		});
	});
})(jQuery);