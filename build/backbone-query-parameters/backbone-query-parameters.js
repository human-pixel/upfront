(function(e,t){typeof exports=="object"&&e.require?module.exports=t(require("underscore"),require("backbone")):typeof define=="function"&&define.amd?define(["underscore","backbone"],function(n,r){return t(n||e._,r||e.Backbone)}):t(_,Backbone)})(this,function(e,t){function c(n,r){function s(e){return String(e).replace(i,encodeURIComponent(i))}var i=t.Router.arrayValueSplit;if(!n)return"";r=r||"";var o=[];return e.each(n,function(t,n){n=r+n;if(e.isString(t)||e.isNumber(t)||e.isBoolean(t)||e.isDate(t))t!=null&&o.push(n+"="+s(encodeURIComponent(t)));else if(e.isArray(t)){var u="";for(var a=0;a<t.length;a++){var f=t[a];f!=null&&(u+=i+s(f))}u&&o.push(n+"="+u)}else{var l=c(t,n+".");l&&o.push(l)}}),o.join("&")}function h(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(t){return e}}function p(t,n){var r=t.split("&");e.each(r,function(e){var t=e.split("=");n(t.shift(),t.join("="))})}var n=/^\?(.*)/,r=/\((.*?)\)/g,i=/(\(\?)?:\w+/g,s=/\*\w+/g,o=/[\-{}\[\]+?.,\\\^$|#\s]/g,u=/^([^\?]*)/,a=/[\:\*]([^\:\?\/]+)/g,f=/^[#\/]|\s+$/g,l=/\/$/;t.Router.arrayValueSplit="|",e.extend(t.History.prototype,{getFragment:function(e,t){if(e==null)if(this._hasPushState||!this._wantsHashChange||t){e=this.location.pathname;var n=this.root.replace(l,""),r=this.location.search;e.indexOf(n)||(e=e.substr(n.length)),r&&this._hasPushState&&(e+=r)}else e=this.getHash();return e.replace(f,"")},getQueryParameters:function(t,r){t=this.getFragment(t,r);var i=t.replace(u,""),s=i.match(n);if(s){i=s[1];var o={};return p(i,function(t,n){n=h(n),o[t]?e.isString(o[t])?o[t]=[o[t],n]:o[t].push(n):o[t]=n}),o}return{}}}),e.extend(t.Router.prototype,{initialize:function(e){this.encodedSplatParts=e&&e.encodedSplatParts},_routeToRegExp:function(t){var n=s.exec(t)||{index:-1},u=i.exec(t)||{index:-1},f=t.match(a)||[];t=t.replace(o,"\\$&").replace(r,"(?:$1)?").replace(i,function(e,t){return t?e:"([^\\/\\?]+)"}).replace(s,"([^??]*?)"),t+="(\\?.*)?";var l=new RegExp("^"+t+"$");return n.index>=0&&(u>=0?l.splatMatch=n.index-u.index:l.splatMatch=-1),l.paramNames=e.map(f,function(e){return e.substring(1)}),l.namedParameters=this.namedParameters,l},_extractParameters:function(r,i){var s=r.exec(i).slice(1),o={};s.length>0&&e.isUndefined(s[s.length-1])&&s.splice(s.length-1,1);var u=s.length&&s[s.length-1]&&s[s.length-1].match(n);if(u){var a=u[1],f={};if(a){var l=this;p(a,function(e,t){l._setParamValue(e,t,f)})}s[s.length-1]=f,e.extend(o,f)}var c=s.length;if(r.splatMatch&&this.encodedSplatParts){if(r.splatMatch<0)return s;c-=1}for(var d=0;d<c;d++)e.isString(s[d])&&(s[d]=h(s[d]),r.paramNames&&r.paramNames.length>=d-1&&(o[r.paramNames[d]]=s[d]));return t.Router.namedParameters||r.namedParameters?[o]:s},_setParamValue:function(e,t,n){e=e.replace("[]",""),e=e.replace("%5B%5D","");var r=e.split("."),i=n;for(var s=0;s<r.length;s++){var o=r[s];s===r.length-1?i[o]=this._decodeParamValue(t,i[o]):i=i[o]=i[o]||{}}},_decodeParamValue:function(n,r){var i=t.Router.arrayValueSplit;if(i&&n.indexOf(i)>=0){var s=n.split(i);for(var o=s.length-1;o>=0;o--)s[o]?s[o]=h(s[o]):s.splice(o,1);return s}return n=h(n),r?e.isArray(r)?(r.push(n),r):[r,n]:n},toFragment:function(t,n){return n&&(e.isString(n)||(n=c(n)),n&&(t+="?"+n)),t}})});