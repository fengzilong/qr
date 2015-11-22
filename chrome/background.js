var rule = {
	conditions : [
		new chrome.declarativeContent.PageStateMatcher({
			pageUrl: {urlContains: ''}
		})
	],
	actions : [new chrome.declarativeContent.ShowPageAction()]
}

chrome.runtime.onInstalled.addListener(function(details) {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([rule]);
	});
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.get == "browser_url"){
		chrome.tabs.getSelected(null, function(tab){
			sendResponse({
				url: tab.url
			});
		});
	}
});

chrome.commands.onCommand.addListener(function( command ){
	chrome.tabs.getSelected(null, function(tab){
		$('#qr').qrcode({
			width: 300,
			height: 300,
			text: tab.url
		});

		var qrCodeDataUrl = $('#qr').find('canvas')[0].toDataURL('image/jpeg');

		//jQuery in code is from content script
		chrome.tabs.executeScript(tab.id, {
			code: `
				(function(){
					if( $('#__qr__').length > 0 ){
						return;
					}
					
					$('<div />').attr('id', '__qr__').css({
						position: 'fixed',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						width: '100%',
						height: '100%',
						'background-color': 'rgba(0,0,0,.4)',
						'z-index': 999
					}).one('click', function(){
						$(this).remove();
					}).append('<img src="` + qrCodeDataUrl + `" />').find('img').css({
						width: '400px',
						height: '400px',
						position: 'absolute',
						left: '50%',
						top: '50%',
					    padding: '15px',
						background: '#FFF',
						'-webkit-transform': 'translate3d(-50%,-50%,0)',
						'transform': 'translate3d(-50%,-50%,0)'
					}).end().appendTo( $('body') );
				})();
			`
		}, function(){
			
		})
	});
});