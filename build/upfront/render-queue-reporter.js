define([],function(){var e=function(e,t,n){var r=0,i=function(){return r},s=0,o=0;Upfront.Events.on("upfront:renderingqueue:add",function(){r++}),e&&typeof e=="function"&&Upfront.Events.on("upfront:renderingqueue:start",e),Upfront.Events.on("upfront:renderingqueue:progress",function(){var e;s++,e=Math.floor(s/r*100),o=e>o?e:o,t&&typeof t=="function"&&t(o)}),Upfront.Events.on("upfront:renderingqueue:done",function(){r=0,s=0,o=0,n&&typeof n=="function"&&n()})};return e});