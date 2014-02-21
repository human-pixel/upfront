(function( $ ) {
	$.fn.upfront_default_slider = function (args) {
		var isMethod = typeof args === 'string',
			result
		;

		this.each(function(){
			var $slider = $(this),
				uslider = $slider.data('uslider')
			;

			if(uslider){
				if(isMethod)
					result = uslider.callMethod(args);
				else
					$.error('jQuery-Uslider is already instantiated');
			}
			else{
				if(isMethod)
					$.error('Can\'t call the ueditor method ' + args + '. The slider is not initialized');
				else {
					// Initialize slider
					$slider.data('uslider', new JQueryUslider($slider, args));
				}
			}
		});

		if( this.length == 1 & typeof result != 'undefined')
			return result;
		return this;
	};


	var JQueryUslider = function($slider, args){
		//debugger;
		var me = this,
			data = $.extend({
				auto: true,
				interval: 5000, // in ms
				auto_height: true, // true | false
				control: 'outside', // outside | inside
				control_num: true,
				control_next_prev: true,
				show_control: 'always', //  always | hover
				effect: 'crossfade', // crossfade | slide-down | slide-up | slide-left | slide-right
				classname: {
					slider: 'upfront-default-slider',
					slider_wrap: 'upfront-default-slider-wrap',
					item: 'upfront-default-slider-item',
					nav: 'upfront-default-slider-nav',
					nav_item: 'upfront-default-slider-nav-item',
					prev: 'upfront-default-slider-nav-prev',
					next: 'upfront-default-slider-nav-next'
				},
				adjust_slide_size: true,
				starting_slide: 0,
				caption_height: false
			}, args),
			$items = data.item ? $slider.find('>'+data.item) : $slider.find('>.'+data.classname.item)
		;

		this.$slider = $slider.data('slider-applied', true)
			.addClass(data.classname.slider)
			.append('<div class="' + data.classname.slider_wrap + '" />')
		;

		this.opts = data;
		this.index = 0;
		this.pause = false;
		this.timer = false;

		this.update_configs();
		this.update_items($items);

		this.$slider.append($('<div class="' + data.classname.nav + '" />'));
		this.update_nav();

		// Next and previous navigation
		if ( data.control_next_prev )
			this.prev_next_navigation();

		this.slider_switch(data.starting_slide);
		this.update_auto_slide();

		this.bind_events();
	};

	JQueryUslider.prototype = {
		callMethod: function(method){
			switch(method) {
				case 'next':
					this.next();
					break;
				case 'prev':
					this.prev();
					break;
			}
		},

		update_configs: function(){
			var $slider = this.$slider,
				slider_auto = $slider.attr('data-slider-auto'),
				data = this.opts
			;
			$slider.removeClass(data.classname.slider + '-control-' + data.control);
			$slider.removeClass(data.classname.slider + '-control-' + data.show_control);
			if ( typeof slider_auto != 'string' )
				slider_auto = data.auto;
			else
				slider_auto = slider_auto == '0' ? false : true;
			data.auto = slider_auto;
			data.interval = $slider.attr('data-slider-interval') || data.interval;
			data.effect = $slider.attr('data-slider-effect') || data.effect;
			data.control = $slider.attr('data-slider-control') || data.control;
			data.show_control = $slider.attr('data-slider-show-control') || data.show_control;
			$slider.addClass(data.classname.slider + '-control-' + data.control);
			$slider.addClass(data.classname.slider + '-control-' + data.show_control);
		},

		update_items: function($new_items){
			var $slider = this.$slider,
				data = this.opts,
				$slider_wrap = $slider.find('.' + data.classname.slider_wrap)
			;
			this.items = $new_items;

			$slider_wrap.html('')
				.append(this.items)
			;

			//add texts
			this.items.each(function(idx, item){
				var slide = $(item),
					captionSelector = slide.data('caption-selector'),
					caption = slide.data('caption'),
					text = slide.find('.uslide-caption')
				;
				if(captionSelector || caption){
					if(!text.length){
						text = $('<div class="uslide-caption" />');
						slide.append(text);
					}
					if(captionSelector)
						text.html($(captionSelector).html());
					else
						text.html(caption);
				}
				else if(text.length)
					text.remove();
			});

			this.items.addClass(data.classname.item);
			if ( data.auto_height ){ // Auto height adjustment to the highest slide
				this.calc_height();
				$slider.find('img').one('load', $.proxy(this.calc_height, this));
			}
			else if(data.adjust_slide_size){ // Adjust slides to available space
				this.adjust_slide_size();
			}
		},

		calc_height: function(){
			var me = this,
				max_height
			;
			this.$slider.css('height', 9999);
			this.items.each(function(){
				var $img = $(this).find('img'),
					$text = $(this).find('.uslide-caption'),
					textHeight = me.opts.caption_height ? $text.outerHeight() : 0,
					img_h = $img.height() + textHeight
				;
				max_height = max_height > img_h ? max_height : img_h;
			});
			this.$slider.css('height', Math.ceil(max_height/15)*15);
		},

		adjust_slide_size: function(){
			var height = this.$slider.outerHeight(),
				width = this.$slider.outerWidth()
			;

			this.items.each(function(){
				var $img = $(this).find('img'),
					img_h = $img.height(),
					img_w = $img.width()
				;
				if ( height/width > img_h/img_w )
					$img.css({ height: '100%', width: 'auto' });
				else
					$img.css({ height: 'auto', width: '100%' });
			});
		},

		update_nav: function(){
			var me = this,
				data = this.opts,
				$nav = this.$slider.find(data.classname.nav)
			;
			$nav.html('');
			if ( data.control_num ){
				this.items.each(function(index){
					$nav.append('<i class="' + data.classname.nav_item + '" data-slider-index="' + index + '">'+index+'</i>');
				});
				this.$slider.on('click', '.'+data.classname.nav_item, function(e){
					e.preventDefault();
					var index = $(this).data('slider-index');
					me.slider_switch(index);
					me.pause = true;
				});
			}
		},

		prev_next_navigation: function(){
			var me = this,
				data = this.opts
			;
			this.$slider.append('<div class="' + data.classname.prev + '" /><div class="' + data.classname.next + '" />')
				.on('click', '.'+data.classname.prev, function(e){
					e.preventDefault();
					me.prev();
				})
				.on('click', '.'+data.classname.next, function(e){
					e.preventDefault();
					me.next();
				})
			;
		},

		next: function(){
			var data = this.opts,
				fx = ( data.effect == 'slide-left' || data.effect == 'slide-right') ? 'slide-left' : ( data.effect == 'crossfade' ? 'crossfade' : 'slide-up' )
			;
			this.slider_switch(this.index+1 >= this.items.length ? 0 : this.index+1, false, fx);
			this.pause = true;
		},

		prev: function(){
			var data = this.opts,
				fx = ( data.effect == 'slide-left' || data.effect == 'slide-right') ? 'slide-right' : ( data.effect == 'crossfade' ? 'crossfade' : 'slide-down' )
			;
			this.slider_switch(this.index > 0 ? this.index-1 : this.items.length-1, false, fx);
			this.pause = true;
		},

		slider_switch: function(index, is_auto, effect){
			var data = this.opts,
				$nav = this.$slider.find(data.classname.nav),
				$slider = this.$slider,
				$n = $nav.find('.'+data.classname.nav_item).eq(index),
				$item = this.items.eq(index),
				current = $slider.find('.'+data.classname.item+'-current')
			;
			if(!effect)
				effect = data.effect;

			if ( !$item.hasClass(data.classname.item+'-current') && !(is_auto && this.pause) ){
				$slider.trigger('slideout', current)
					.find('div.slide-previous').removeClass('slide-previous');
				current.removeClass(data.classname.item+'-current').addClass('slide-previous');
				$item.addClass(data.classname.item+'-current');
				$nav.find('.'+data.classname.nav_item+'-selected').removeClass(data.classname.nav_item+'-selected');
				$n.addClass(data.classname.nav_item+'-selected');
				this.index = index;
				// Animation effect
				$item.addClass(data.classname.item+'-effect-'+effect);
				$item.one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
					$(this).removeClass(data.classname.item+'-effect-'+effect);
					if($item.hasClass(data.classname.item+'-current'))
						$slider.trigger('slidein', [$item, index]);
				});
			}
			this.pause = false;
		},

		update_auto_slide: function() {
			var me = this,
				data = this.opts
			;
			if ( this.timer )
				clearInterval(this.timer);
			if ( data.auto && data.interval > 999 ){
				this.timer = setInterval(function(){
					me.slider_switch( me.index+1 >= me.items.length ? 0 : me.index+1, true );
				}, data.interval);
			}
		},

		bind_events: function(){
			var me = this,
				$slider = me.$slider,
				data = me.opts
			;
			$slider.on('refresh', function(){
				var $new_items = data.item ? $slider.find('>'+data.item) : $slider.find('>.'+data.classname.item),
					new_length = $new_items.length,
					length = me.items.length
				;
				me.update_configs();
				me.update_auto_slide();
				if ( new_length ){
					me.update_items($new_items);
					me.update_nav();
					if ( new_length != length )
						me.slider_switch(data.starting_slide);
				}
				if ( !data.auto_height && data.adjust_slide_size){
					me.adjust_slide_size();
					me.items.find('img').one('load', $.proxy(me.adjust_slide_size, me));
				}
			})
			.on('pause', function(){
				clearInterval(me.timer);
			})
			.on('resume', function(){
				me.update_auto_slide();
			});
		}
	};

	$(document).ready(function(){
		// Inline post slider setup
		var inline_slider = {
			item: '.upfront-inserted_image-wrapper',
			control_next_prev: false
		};
		$('.upfront-inline_post-slider').upfront_default_slider(inline_slider);

		// Bg slider
		var bg_slider = {
			auto_height: false,
			control: 'inside'
		};
		$('.upfront-bg-slider').upfront_default_slider(bg_slider);

		// Integration with Upfront editor
		$(document).on('upfront-load', function(){
			Upfront.Events.on('application:mode:after_switch', function(){
				$('.upfront-inline_post-slider').upfront_default_slider(inline_slider);
			});
			Upfront.Events.on('entity:background:update', function(view, model){
				var $s = view.$el.find('.upfront-region-bg-slider');
				if ( $s.length ){
					if ( $s.data('slider-applied') )
						$s.trigger('refresh');
					else
						$s.upfront_default_slider(bg_slider);
				}
			});
		});

		/*
		CKEDITOR.on('currentInstance', function(){
			editor = CKEDITOR.currentInstance;
			//$('.upfront-inline_post-slider').upfront_default_slider(inline_slider);
			if ( !editor )
				return;
			editor.on('insertHtml', function(){
			//	$('.upfront-inline_post-slider').upfront_default_slider(inline_slider);
			});
		}); */
	});

}( jQuery ));