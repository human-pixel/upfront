jQuery(document).ready(function(e){function t(){e(".upfront-output-region-container").each(function(){var t=e(this).find(".upfront-output-region"),n=e(this).hasClass("upfront-region-container-full"),r=i=0;if(n){var i=e(window).height();t.css({minHeight:i,height:i,maxHeight:i})}else t.length>1&&(t.each(function(){var t=parseInt(e(this).css("min-height")),n=e(this).outerHeight();t&&(r=t>r?t:r),i=n>i?n:i}),t.css({minHeight:i,height:"",maxHeight:""}))})}function n(){e("[data-bg-image-ratio]").each(function(){var t=e(this).outerWidth(),n=e(this).outerHeight(),r=parseFloat(e(this).attr("data-bg-image-ratio"));Math.round(n/t*100)/100>r?e(this).css("background-size",n/r+"px "+n+"px"):e(this).css("background-size",t+"px "+t*r+"px")}),e("[data-bg-video-ratio]").each(function(){var t=e(this).outerWidth(),n=e(this).outerHeight(),r=parseFloat(e(this).attr("data-bg-video-ratio")),i=e(this).attr("data-bg-video-style")||"crop",s=e(this).children("iframe");e(this).css("overflow","hidden"),s.css({position:"absolute"});if(i=="crop")if(Math.round(n/t*100)/100>r){var o=n/r;s.css({width:o,height:n,top:0,left:(t-o)/2})}else{var u=t*r;s.css({width:t,height:u,top:(n-u)/2,left:0})}else if(i=="full")s.css({top:0,left:0,width:t,height:n});else if(i=="inside")if(Math.round(n/t*100)/100<r){var o=n/r;s.css({width:o,height:n,top:0,left:(t-o)/2})}else{var u=t*r;s.css({width:t,height:u,top:(n-u)/2,left:0})}})}t(),e(window).on("load",t),e(window).on("resize",t),n(),e(window).on("resize",n)});