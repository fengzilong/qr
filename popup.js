(function( $ ){
	Promise.all( [ getActivePageUrl(), getLocalIPs() ] )
		.then( filterValidIPs )
		.then( replaceWithLocalIP )
		.then( genQrCode )
		.catch( noop )

	function getActivePageUrl() {
		return new Promise( function( resolve, reject ) {
			chrome.tabs.query( { active: true }, function( tabs ){
				const tab = tabs[ 0 ];
				if ( tab ) {
					resolve( tab.url );
				} else {
					reject( new Error( 'failed' ) );
				}
			} );
		} );
	}

	function filterValidIPs( data ) {
		const url = data[ 0 ];
		const ips = data[ 1 ];
		let validIPs = ips.filter( function( ip ) { return !~ip.indexOf( ':' ) } )
		return [ url, validIPs ];
	}

	function replaceWithLocalIP( data ) {
		const url = data[ 0 ];
		const ips = data[ 1 ];
		return ips.map( function( ip ) {
			return url.replace( /^(https*:\/\/)(127\.0\.0\.1|localhost)/, `$1${ ip }` );
		} );
	}

	// See: http://stackoverflow.com/a/29514292
	function getLocalIPs() {
		return new Promise( function( resolve, reject ) {
			var ips = [];

			var RTCPeerConnection = window.RTCPeerConnection ||
				window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

			var pc = new RTCPeerConnection( {
				iceServers: []
			} );
			pc.createDataChannel( '' );

			pc.onicecandidate = function( e ) {
				if ( !e.candidate ) {
					pc.close();
					resolve( ips );
					return;
				}
				var ip = /^candidate:.+ (\S+) \d+ typ/.exec( e.candidate.candidate )[ 1 ];
				if ( ips.indexOf( ip ) == -1 ) {
					ips.push( ip );
				}
			};
			pc.createOffer( function( sdp ) {
				pc.setLocalDescription( sdp );
			}, function onerror() {} );
		} );
	}

	function genQrCode( urls ) {
		var i = 0;

		$( '#qr' )
			.qrcode( {
				width: 260,
				height: 260,
				text: urls[ i ]
			} )
			.attr( 'title', urls[ i ] )
			.on( 'click', function() {
				i = ( i + 1 ) % urls.length;

				$( this )
					.html( '' )
					.qrcode( {
						width: 260,
						height: 260,
						text: urls[ i ],
					} )
					.attr( 'title', urls[ i ] )
			} )
	}

	function noop() {}
})( jQuery );
