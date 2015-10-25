jQuery(document).ready(function(e){function n(e){var t=document.createElement("div"),n=new RegExp("(khtml|moz|ms|webkit|)"+e,"i");for(s in t.style)if(s.match(n))return!0;return!1}function o(){window.getComputedStyle||(window.getComputedStyle=function(e,t){return this.el=e,this.getPropertyValue=function(t){var n=/(\-([a-z]){1})/g;return t=="float"&&(t="styleFloat"),n.test(t)&&(t=t.replace(n,function(){return arguments[2].toUpperCase()})),e.currentStyle[t]?e.currentStyle[t]:null},this});var e=window.getComputedStyle(document.body,":after").getPropertyValue("content");if(e)return e=e.replace(/['"]/g,""),i!=e&&(r=i,i=e),e}function l(e){f.push(e);if(!u){var t=document.createElement("script");t.src="https://www.youtube.com/iframe_api";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n),window.onYouTubeIframeAPIReady=function(){a=!0,c()},u=!0;return}a&&c()}function c(){for(var e=0;e<f.length;e++)var t=new YT.Player(f[e],{events:{onReady:h}});f=[]}function h(e){e.target.mute();var t,n;setInterval(function(){t=e.target.getCurrentTime(),n=e.target.getDuration(),t>n-.5&&(e.target.seekTo(0),e.target.playVideo())},200)}function d(e){p||(window.addEventListener?window.addEventListener("message",v,!1):window.attachEvent("onmessage",v,!1),p=!0)}function v(t){if(!t.origin.match(/vimeo\./))return;var n=JSON.parse(t.data);if(n.event=="ready"){var r=e("#"+n.player_id),i=r.attr("src").split("?"),n={method:"setVolume",value:0};r[0].contentWindow.postMessage(n,i)}}function y(){var t=e(window).width();if(g&&m===t)return;g=!0,m=t;var n=o();n=n?n:"desktop",e("[data-bg-type-"+n+"]").each(function(){var t=e(this).attr("data-bg-type-"+n),r=e(this).find("> .upfront-output-bg-"+n);e(this).find("> .upfront-output-bg-overlay").not(r).each(function(){e(this).is(".upfront-output-bg-video")&&e(this).children().not("script.video-embed-code").remove(),e(this).attr("data-bg-parallax")&&e(this).data("uparallax")&&e(this).uparallax("destroy")}),r.attr("data-bg-parallax")&&setTimeout(function(){var e=r.closest(".upfront-output-region-container");if(e.length){var t=e.next(".upfront-output-region-container").find(".upfront-region-container-bg"),i=e.prev(".upfront-output-region-container").find(".upfront-region-container-bg"),s=t.css("background-color"),o=t.attr("data-bg-type-"+n),u=i.css("background-color"),a=i.attr("data-bg-type-"+n),f=function(e){if(!e)return!1;var t=e.match(/(rgba|hsla)\(.*?,.*?,.*?,.*?([\d.]+).*?\)/);return t&&t[2]&&parseFloat(t[2])<1?!0:!1},l=i.length>0&&a=="color"&&u&&f(u)?0:!1,c=t.length>0&&o=="color"&&s&&f(s)?0:!1;r.uparallax({element:r.attr("data-bg-parallax")}),!1===l&&i.length>0&&i.height()<100&&(l=i.height()),!1===c&&t.length>0&&t.height()<100&&(c=t.height()),!1!==l&&r.uparallax("setOption","overflowTop",l),!1!==c&&r.uparallax("setOption","overflowBottom",c)}},0);if(t=="image"||t=="featured"){var i=e(this).attr("data-bg-overlay-"+n),s=i?r.children(".upfront-bg-image"):e(this),o=s.attr("data-src"),u=s.attr("data-src-"+n),a=s.attr("data-bg-image-ratio-"+n);i&&e(this).css("background-image","none"),u?s.attr("data-src",u):s.removeAttr("data-src"),a?s.attr("data-bg-image-ratio",a):s.removeAttr("data-bg-image-ratio").css("background-position","").css("background-size",""),u&&o!=u&&s.hasClass("upfront-image-lazy")&&s.removeClass("upfront-image-lazy-loaded")}else t=="color"?e(this).css("background-image","none"):(e(this).css("background-image","none"),r.each(function(){if(e(this).is(".upfront-output-bg-video")&&e(this).children().length==1){var t=e(e(this).children("script.video-embed-code").html()),n=t.attr("id");e(this).append(t);if(e(this).attr("data-bg-video-mute")==1){var r=t.attr("src");r.match(/youtube\.com/i)?l(n):r.match(/vimeo\./i)&&d(n)}}}))})}function w(){E(),e(".upfront-output-region-container").each(function(){var t=e(this).find(".upfront-output-region").filter(".upfront-region-center, .upfront-region-side-left, .upfront-region-side-right"),n=e(this).hasClass("upfront-region-container-full"),r=height=0;t.length>1&&(t.each(function(){var t=parseInt(e(this).css("min-height")),n=e(this).outerHeight();t&&(r=t>r?t:r),height=n>height?n:height}),t.css({minHeight:height,height:"",maxHeight:""}))})}function E(){e(".upfront-output-region-container.upfront-region-container-full").each(function(){var t=e(this).find(".upfront-region-center"),n=e(this).find(".upfront-region-side-top, .upfront-region-side-bottom"),r=e("body").offset(),i=e(window).height()-r.top,s=e(this).find(".upfront-output-bg-overlay");s.length&&s.css("height",i),n.each(function(){i-=e(this).outerHeight()}),t.css({minHeight:i});var o=e(this).attr("data-behavior"),u=parseInt(e(this).attr("data-original-height"));if(o=="keep-ratio"&&u>0){var a=t.find("> .upfront-region-wrapper > .upfront-output-wrapper"),f=t.offset(),l=[],c=[],h=-1,p=0,d=0,v=!1,m=!1,g=!1,y=!1,b=0;a.each(function(){var t=e(this).find("> .upfront-output-module, > .upfront-output-module-group");t.css("margin-top","");var n=e(this).offset(),r=e(this).height();Math.abs(n.left-f.left)<5?(h++,c[h]={wrappers:[],height:r}):r>c[h].height&&(c[h].height=r);var i={$el:e(this),space:0,fill:0,modules:[]};t.each(function(){var t=parseInt(e(this).css("margin-top")),n=e(this).height();i.space+=t,i.fill+=n,i.modules.push({$el:e(this),top:t,height:n})}),c[h].wrappers.push(i)}),e.each(c,function(e,t){p+=t.height}),d=u>p?u-p:0,avail_bottom_space=i-u+d;var w=function(t,n){var r=0,t=typeof t=="number"?t:0,n=typeof n=="number"?n:-1;return e.each(c,function(i,s){if(i<t||n>-1&&i>n)return;var o=0;e.each(s.wrappers,function(e,t){o=t.space>o?t.space:o}),r+=o}),r};e.each(c,function(t,n){var r=0,i=0;t>0&&(r=w(0,t-1)),t<c.length-1&&(i=w(t+1)),e.each(n.wrappers,function(t,n){var s=r+i+d+n.space,o=r+i+avail_bottom_space+n.space;o=o>0?o:0,e.each(n.modules,function(e,t){var n=t.top/s*o;t.$el.css("margin-top",n+"px")})})})}})}function T(){var t=e("body").offset();e("[data-bg-image-ratio]").each(function(){var n=e(this).is(".upfront-output-layout"),r=(e(this).is(".upfront-region-container-bg")||e(this).is(".upfront-output-region"))&&e(this).closest(".upfront-region-container-full").length>0,i=n?e(window).width():e(this).outerWidth(),s=n?e(window).height():r?e(window).height()-t.top:e(this).outerHeight(),o=parseFloat(e(this).attr("data-bg-image-ratio"));Math.round(s/i*100)/100>o?(e(this).data("bg-position-y",0),e(this).data("bg-position-x","50%"),e(this).css({"background-position":"50% 0","background-size":Math.round(s/o)+"px "+s+"px"})):(e(this).data("bg-position-y",Math.round((s-i*o)/2)),e(this).data("bg-position-x","0"),e(this).css({"background-position":"0 "+Math.round((s-i*o)/2)+"px","background-size":i+"px "+Math.round(i*o)+"px"}))}),e("[data-bg-video-ratio]").each(function(){var n=e(this).parent().is(".upfront-output-layout"),r=e(this).parent().is(".upfront-output-region, .upfront-region-container-bg")&&e(this).closest(".upfront-region-container-full").length>0,i=n?e(window).width():e(this).outerWidth(),s=n?e(window).height():r?e(window).height()-t.top:e(this).outerHeight(),o=parseFloat(e(this).attr("data-bg-video-ratio")),u=e(this).attr("data-bg-video-style")||"crop",a=e(this).children("iframe");e(this).css("overflow","hidden"),a.css({position:"absolute"});if(u=="crop")if(Math.round(s/i*100)/100>o){var f=Math.round(s/o);a.css({width:f,height:s,top:0,left:Math.round((i-f)/2)})}else{var l=Math.round(i*o);a.css({width:i,height:l,top:Math.round((s-l)/2),left:0})}else if(u=="full")a.css({top:0,left:0,width:i,height:s});else if(u=="inside")if(Math.round(s/i*100)/100<o){var f=Math.round(s/o);a.css({width:f,height:s,top:0,left:Math.round((i-f)/2)})}else{var l=Math.round(i*o);a.css({width:i,height:l,top:Math.round((s-l)/2),left:0})}}),e(".upfront-output-object .uf-post .thumbnail").each(function(){var t=e(this).height(),n=e(this).width(),r=e(this).find("img"),i,s;e(this).attr("data-resize")=="1"?(r.css({height:"",width:""}),i=r.height(),s=r.width(),t/n>i/s?r.css({height:"100%",width:"auto",marginLeft:(n-Math.round(t/i*s))/2,marginTop:""}):r.css({height:"auto",width:"100%",marginLeft:"",marginTop:(t-Math.round(n/s*i))/2})):(i=r.height(),t!=i&&r.css("margin-top",(t-i)/2))})}function C(){var t=o(),n=e("body").offset(),r=e(window).scrollTop(),i=e(window).height(),s=r+i;n.top>0&&(r+=n.top,i-=n.top),r=r<n.top?n.top:r,e('.upfront-output-region-container[data-sticky="1"], .upfront-output-region-sub-container[data-sticky="1"]').each(function(){var t=e(this).hasClass("upfront-output-region-sub-container"),i=t&&e(this).nextAll(".upfront-grid-layout").length>0,s=e(this).offset(),o=e(this).data("sticky-top"),u={};typeof o!="number"&&r>s.top?(u.position="fixed",u.top=e("#wpadminbar").css("position")!="fixed"?0:n.top,u.left=0,u.right=0,u.bottom="auto",e(this).addClass("upfront-output-region-container-sticky"),e(this).data("sticky-top",s.top),t?e(this).closest(".upfront-region-container-bg").css(i?"padding-top":"padding-bottom",e(this).height()):e(this).next(".upfront-output-region-container").css("padding-top",e(this).height())):typeof o=="number"&&r<=o&&(u.position="",u.top="",u.left="",u.right="",u.bottom="",e(this).removeClass("upfront-output-region-container-sticky"),e(this).removeData("sticky-top"),t?e(this).closest(".upfront-region-container-bg").css(i?"padding-top":"padding-bottom",""):e(this).next(".upfront-output-region-container").css("padding-top","")),e(this).css(u)}),e('.upfront-output-region-container.upfront-region-container-full, .upfront-output-region-container.upfront-region-container-full .upfront-output-region-sub-container:not(.upfront-output-region-container-sticky), .upfront-output-region.upfront-region-side-fixed[data-restrict-to-container="1"]').each(function(){var t=e(this).is(".upfront-region-side-fixed"),o=e(this).is(".upfront-region-container-full"),u=e(this).is(".upfront-output-region-sub-container"),a=e(this).closest(".upfront-output-region-container"),f=a.outerHeight(),l=a.offset(),c=l.top+f,h=e(this).height(),p=t?parseInt(e(this).attr("data-top")):0,d=t?typeof e(this).attr("data-top")!="undefined":e(this).nextAll(".upfront-grid-layout").length>0,v=t?parseInt(e(this).attr("data-bottom")):0,m=t?typeof e(this).attr("data-bottom")!="undefined":e(this).prevAll(".upfront-grid-layout").length>0,g={};if(o){var y=e(this).find(".upfront-region-container-bg"),b=y.css("background-image")!="none",w=e(this).find(".upfront-output-bg-overlay"),E=w.length>0,S=0,x=0,T=y.css("background-position"),N=parseInt(e(this).find(".upfront-region-center").css("min-height"));if(b){typeof y.data("bg-position-y")=="undefined"&&y.data("bg-position-y",T.match(/\d+(%|px|)$/)[0]),typeof y.data("bg-position-x")=="undefined"&&y.data("bg-position-x",T.match(/^\d+(%|px|)/)[0]),S=y.data("bg-position-y"),x=y.data("bg-position-x");if(typeof S=="string"&&S.match(/%$/)){var C=new Image;C.src=y.css("background-image").replace(/^url\(\s*['"]?\s*/,"").replace(/\s*['"]?\s*\)$/,""),S=parseInt(S)/100*(h-C.height)}else S=parseInt(S)}}if(r>=l.top&&s<=c){if(t||u)g.position="fixed",d?g.top=p+n.top:g.bottom=v;u&&(g.left=0,g.right=0,d?a.find("> .upfront-region-container-bg").css("padding-top",h):a.find("> .upfront-region-container-bg").css("padding-bottom",h)),o&&(b?y.css("background-position",x+" "+(S+r-n.top)+"px"):E&&w.css("top",r-n.top))}else t?(g.position="absolute",d?f>i&&r>=l.top+f-i?g.top=f-i+p:g.top=p:f>i&&s<=l.top+i?g.bottom=f-i+v:g.bottom=v):u?(g.position="relative",d&&(g.top=f-i+p),g.bottom="",g.left="",g.right="",a.find("> .upfront-region-container-bg").css({paddingTop:"",paddingBottom:""})):o&&(b?y.css("background-position",x+" "+(S+(f-i))+"px"):E&&w.css("top",f-i));e(this).css(g)})}function P(){clearTimeout(M),M=setTimeout(function(){var t=e(window).scrollTop(),n=e(window).height(),r=e(window).width();e(".upfront-image-lazy").each(function(){if(e(this).hasClass("upfront-image-lazy-loading"))return;var r=this,i=e(this).offset(),s=e(this).height(),o=e(this).width(),u,a,f;if((D&&i.top+s>=t&&i.top<t+n||!D)&&o>0&&s>0){u=e(this).attr("data-sources"),u?u=JSON.parse(u):a=e(this).attr("data-src");if(typeof u!="undefined"&&u.length||a){if(typeof u!="undefined"&&u.length){for(var l=0;l<u.length;l++)if(u[l][1]<=o||f>=0&&u[f][1]<o&&u[l][1]>o)f=l;if(e(this).data("loaded")==f)return;a=u[f][0],e(this).data("loaded",f)}else if(a&&e(this).hasClass("upfront-image-lazy-loaded"))return;e(this).removeClass("upfront-image-lazy-loaded").addClass("upfront-image-lazy-loading"),e("<img>").attr("src",a).on("load",function(){e(r).hasClass("upfront-image-lazy-bg")?e(r).css("background-image",'url("'+e(this).attr("src")+'")'):e(r).attr("src",e(this).attr("src")),e(r).removeClass("upfront-image-lazy-loading").addClass("upfront-image-lazy-loaded")})}}})},100)}function H(){function r(t){var n=new e.Deferred;return t.$el.removeClass("upfront-image-lazy-loaded").addClass("upfront-image-lazy-loading"),e("<img />").attr("src",t.url).on("load",function(){t.$el.is(".upfront-image-lazy-bg")?t.$el.css("background-image",'url("'+t.url+'")'):t.$el.attr("src",t.url),t.$el.removeClass("upfront-image-lazy-loading").addClass("upfront-image-lazy-loaded"),n.resolve()}).on("error abort",function(){n.reject()}),n.promise()}function i(e,t){n.push({url:e,$el:t})}function s(){var i=new e.Deferred;return e.each(n,function(e,n){t.push(r(n))}),e.when.apply(e,t).always(function(){i.resolve()}),i.promise()}var t=[],n=[];return{add:i,start:s}}function B(e){function t(){e.reverse(),n()}function n(){var t=e.pop();if(!t)return!1;t.start().done(n)}return{start:t}}function j(){var t=1500,n=e(".upfront-image-lazy"),r=new H,i=new H,s=new H,u=e(window).scrollTop(),a=e(window).height(),f=e(window).width(),l=o();l=!l||"none"===l?"desktop":l;if(!n.length)return!1;n.each(function(){var n=e(this),o=n.offset(),f=n.attr("data-sources"),c=n.attr("data-src"),h=n.attr("data-src-"+l),p=n.height(),d=n.width();if(n.is(".upfront-image-lazy-loaded"))return!0;if(!f&&!c&&!h)return!0;if(p<=0&&d<=0)return!0;if(f){var d=n.width(),v=0;f=JSON.parse(f);for(var m=0;m<f.length;m++)if(f[m][1]<=d||v>=0&&f[v][1]<d&&f[m][1]>d)v=m;if(e(this).data("loaded")==v)return!0;c=f[v][0],e(this).data("loaded",v)}else h&&(c=h);o.top+p>=u&&o.top<u+a?r.add(c,n):o.top+p+t>=u&&o.top<u+a+t?i.add(c,n):s.add(c,n)}),e(window).off("scroll",P);var c=(new B([r,i,s])).start()}function I(){var t=o();e("[data-theme-styles]").each(function(){var n=e(this).attr("data-theme-styles"),r=[];n=n.replace('"default":','"defaults":'),n&&(n=JSON.parse(n)),e.each(n,function(e,t){r.push(t)}),e(this).removeClass(r.join(" ")),!t&&n.defaults?e(this).addClass(n.defaults):t&&(n[t]||n.defaults)&&e(this).addClass(n[t]?n[t]:n.defaults)})}function R(){var t=o();if(e("#page").hasClass("upfront-layout-view"))return U();r&&e("#page").removeClass(r+"-breakpoint"),t&&t!=="none"&&t!=="desktop"?(e("html").addClass("uf-responsive"),e("#page").removeClass("desktop-breakpoint default-breakpoint").addClass("responsive-breakpoint "+t+"-breakpoint")):(e("#page").removeClass("responsive-breakpoint").addClass("default-breakpoint desktop-breakpoint"),U())}function U(){e("html").removeClass("uf-responsive")}function z(){var t=o();t&&e("#page").removeClass(t+"-breakpoint")}function X(){e(window).off("resize.uf_layout"),e(window).off("scroll.uf_layout"),e(window).off("load.uf_layout"),e(".upfront-output-layout .upfront-parallax").uparallax("destroy")}var t=function(e,t,n){var r,i,s,o=null,u=0;n||(n={});var a=function(){u=n.leading===!1?0:(new Date).getTime(),o=null,s=e.apply(r,i),o||(r=i=null)};return function(){var f=(new Date).getTime();u||n.leading!==!1||(u=f);var l=t-(f-u);return r=this,i=arguments,0>=l||l>t?(clearTimeout(o),o=null,u=f,s=e.apply(r,i),o||(r=i=null)):o||n.trailing===!1||(o=setTimeout(a,l)),s}},r="",i="",u=!1,a=!1,f=[],p=!1,m=e(window).width(),g=!1;y();var b=t(y,300);e(window).on("resize.uf_layout",b);var S=t(E,100),x=t(w,100);n("flex")?(e("html").addClass("flexbox-support"),E(),e(window).on("load.uf_layout",E),e(window).on("resize.uf_layout",S)):(w(),e(window).on("load.uf_layout",w),e(window).on("resize.uf_layout",x)),T();var N=t(T,500);e(window).on("resize.uf_layout",N),e(window).on("load.uf_layout",N),C(),e(window).on("load.uf_layout",C);var k=t(C,100);e(window).on("scroll.uf_layout",C),e(window).on("resize.uf_layout",k);var L=e('<div class="upfront-lightbox-bg"></div>'),A=e('<div class="upfront-ui close_lightbox"></div>'),O=e('<div class="upfront-icon upfront-icon-popup-close"></div>');e("[data-group-link]").each(function(){e(this).css({cursor:"pointer"}),e(this).live("click",function(){var t=e(this).data("groupLink"),n=e(this).data("groupTarget");if(t.indexOf("#")===-1){window.open(t,e(this).data("groupTarget"));return}if(t.match(/^#.*/)!==null){var r=e('.upfront-output-region-container[data-sticky="1"], .upfront-output-region-sub-container[data-sticky="1"]').first(),i=r.height()?r.height():0;e("html,body").animate({scrollTop:e(t).offset().top-i},"slow");return}var s=t.split("#");if(s[0]===location.origin+location.pathname){var r=e('.upfront-output-region-container[data-sticky="1"], .upfront-output-region-sub-container[data-sticky="1"]').first(),i=r.height()?r.height():0;e("html,body").animate({scrollTop:e("#"+s[1]).offset().top-i},"slow");return}if(e(this).attr("target")==="_blank"){window.open(t);return}window.location=t})}),e(document).on("click","a",function(t){if(e(t.target).closest("div.redactor_box")>0)return;if(e("div#sidebar-ui").length>0&&e("div#sidebar-ui").css("display")=="block"){if(e(t.target).hasClass("upfront_cta")){t.preventDefault();return}var n=e(t.target).attr("href");if(n&&n.indexOf&&n.indexOf("#ltb-")>-1){t.preventDefault();var r=Upfront.Application.layout.get("regions"),i=n.split("#");region=r?r.get_by_name(i[1]):!1;if(region){_.each(r.models,function(e){e.attributes.sub=="lightbox"&&Upfront.data.region_views[e.cid].hide()});var s=Upfront.data.region_views[region.cid];s.show()}}return}var n=e(this).attr("href");if(!n)return;if(n.indexOf("#")===-1)return;if(e(this).closest("div.upfront-navigation").data("style")=="burger"&&e(this).parent("li.menu-item.menu-item-has-children").length>0){var o=e(this).parent("li.menu-item.menu-item-has-children");o.children("ul.sub-menu").closest("li.menu-item").hasClass("burger_sub_display")?o.children("ul.sub-menu").closest("li.menu-item").removeClass("burger_sub_display"):o.children("ul.sub-menu").closest("li.menu-item").addClass("burger_sub_display");var u=o.closest("ul.menu"),a=u.closest("div.upfront-output-unewnavigation").children("div");if(a.data("burger_over")=="pushes"&&a.data("burger_alignment")=="top"){e("div#page").css("margin-top",u.height());var f=e("div#wpadminbar").outerHeight();u.offset({top:f,left:e("div").offset().left})}}t.preventDefault();var l=n.split("#");if(l[1].trim()==="")return;if(l[1].trim().indexOf("ltb-")==0){var c=e("div.upfront-region-"+l[1].trim());L.css("background-color",c.data("overlay")).insertBefore(c);if(c.data("closeicon")=="yes"||c.data("addclosetext")=="yes")c.prepend(A),c.data("addclosetext")=="yes"&&(A.append(e("<h3>"+c.data("closetext")+"</h3>")),c.data("closeicon")=="yes"&&A.children("h3").css("margin-right","40px")),c.data("closeicon")=="yes"&&A.append(O),A.bind("click",function(){h()});c.data("clickout")=="yes"&&L.bind("click",function(){h()}),c.css("width",e("div.upfront-grid-layout").first().width()*c.data("col")/24),c.show().css({"margin-left":-parseInt(c.width()/2),"margin-top":-parseInt(c.height()/2)}),e(document).trigger("upfront-lightbox-open"),t.preventDefault();function h(){A.html("").remove(),L.remove(),c.hide()}return}var p=e('.upfront-output-region-container[data-sticky="1"], .upfront-output-region-sub-container[data-sticky="1"]').first(),d=p.height()?p.height():0;if(n.match(/^#.*/)!==null){e("html,body").animate({scrollTop:e(n).offset().top-d},"slow");return}var v=n.split("#");if(v[0]===location.origin+location.pathname){e("html,body").animate({scrollTop:e("#"+v[1]).offset().top-d},"slow");return}if(e(this).attr("target")==="_blank"){window.open(n);return}window.location=n});var M,D=window._upfront_image_lazy_scroll,F=t(P,100);e(window).on("resize",F),D?(e(window).on("scroll",F),P()):e(j),I();var q=t(I,100);e(window).on("resize.uf_layout",q),R();var W=t(R,100);e(window).on("resize.uf_layout",W),e(document).on("upfront-load",function(){Upfront.Events.once("application:mode:before_switch",X),Upfront.Events.once("application:mode:before_switch",z),Upfront.Events.once("layout:render",U)})});