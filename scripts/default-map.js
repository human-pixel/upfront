(function($){

	function init_map ($el) {
		if ( $el.data('map') )
			return;
		var data = JSON.parse($el.attr('data-bg-map')),
			options = {
				center: new google.maps.LatLng(data.center[0], data.center[1]),
				zoom: parseInt(data.zoom),
				mapTypeId: google.maps.MapTypeId[data.style],
				panControl: (data.controls && data.controls.indexOf("pan") >= 0),
				zoomControl: (data.controls && data.controls.indexOf("zoom") >= 0),
				mapTypeControl: (data.controls && data.controls.indexOf("map_type") >= 0),
				scaleControl: (data.controls && data.controls.indexOf("scale") >= 0),
				streetViewControl: (data.controls && data.controls.indexOf("street_view") >= 0),
				overviewMapControl: (data.controls && data.controls.indexOf("overview_map") >= 0),
				scrollwheel: false,
				styles: data.styles
			},
			map = new google.maps.Map($el.get(0), options);
		$el.data('map', map);
	}

	function load_google_maps () {
		if ($(document).data("upfront-google_maps-loading")) return false;
		$(document).data("upfront-google_maps-loading", true);
		if (typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.Map === 'object') return upfront_bg_map_init();
		var protocol = '',
			script = document.createElement("script")
		;
		try { protocol = document.location.protocol; } catch (e) { protocol = 'http:'; }
		script.type = "text/javascript";
		script.src = protocol + "//maps.google.com/maps/api/js?v=3&libraries=places&sensor=false&callback=upfront_maps_loaded";
		document.body.appendChild(script);
	}

	function upfront_bg_map_init () {
		$("[data-bg-map]").each(function () {
			if ( $(this).css('display') != 'none' )
				init_map($(this));
		});
	}

	$(document).on('upfront-google_maps-loaded', upfront_bg_map_init);

	if (!window.upfront_maps_loaded) {
		window.upfront_maps_loaded = window.upfront_maps_loaded || function () {
			$(document).trigger("upfront-google_maps-loaded");
			$(document).data("upfront-google_maps-loading", false);
			$(window).on('resize', upfront_bg_map_init);
		};
		$(load_google_maps);
	}

})(jQuery);
