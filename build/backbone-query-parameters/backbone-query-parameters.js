!function(e,t){"object"==typeof exports&&e.require?module.exports=t(require("underscore"),require("backbone")):"function"==typeof define&&define.amd?define(["underscore","backbone"],function(r,n){return t(r||e._,n||e.Backbone)}):t(_,Backbone)}(this,function(e,t){function r(n,a){function i(e){return String(e).replace(s,encodeURIComponent(s))}var s=t.Router.arrayValueSplit;if(!n)return"";a=a||"";var o=[];return e.each(n,function(t,n){if(n=a+n,e.isString(t)||e.isNumber(t)||e.isBoolean(t)||e.isDate(t))null!=t&&o.push(n+"="+i(encodeURIComponent(t)));else if(e.isArray(t)){for(var u="",c=0;c<t.length;c++){var l=t[c];null!=l&&(u+=s+i(l))}u&&o.push(n+"="+u)}else{var h=r(t,n+".");h&&o.push(h)}}),o.join("&")}function n(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(t){return e}}function a(t,r){var n=t.split("&");e.each(n,function(e){var t=e.split("=");r(t.shift(),t.join("="))})}var i=/^\?(.*)/,s=/\((.*?)\)/g,o=/(\(\?)?:\w+/g,u=/\*\w+/g,c=/[\-{}\[\]+?.,\\\^$|#\s]/g,l=/^([^\?]*)/,h=/[\:\*]([^\:\?\/]+)/g,p=/^[#\/]|\s+$/g,f=/\/$/;t.Router.arrayValueSplit="|",e.extend(t.History.prototype,{getFragment:function(e,t){if(null==e)if(this._hasPushState||!this._wantsHashChange||t){e=this.location.pathname;var r=this.root.replace(f,""),n=this.location.search;e.indexOf(r)||(e=e.substr(r.length)),n&&this._hasPushState&&(e+=n)}else e=this.getHash();return e.replace(p,"")},getQueryParameters:function(t,r){t=this.getFragment(t,r);var s=t.replace(l,""),o=s.match(i);if(o){s=o[1];var u={};return a(s,function(t,r){r=n(r),u[t]?e.isString(u[t])?u[t]=[u[t],r]:u[t].push(r):u[t]=r}),u}return{}}}),e.extend(t.Router.prototype,{initialize:function(e){this.encodedSplatParts=e&&e.encodedSplatParts},_routeToRegExp:function(t){var r=u.exec(t)||{index:-1},n=o.exec(t)||{index:-1},a=t.match(h)||[];t=t.replace(c,"\\$&").replace(s,"(?:$1)?").replace(o,function(e,t){return t?e:"([^\\/\\?]+)"}).replace(u,"([^??]*?)"),t+="(\\?.*)?";var i=new RegExp("^"+t+"$");return r.index>=0&&(n>=0?i.splatMatch=r.index-n.index:i.splatMatch=-1),i.paramNames=e.map(a,function(e){return e.substring(1)}),i.namedParameters=this.namedParameters,i},_extractParameters:function(r,s){var o=r.exec(s).slice(1),u={};o.length>0&&e.isUndefined(o[o.length-1])&&o.splice(o.length-1,1);var c=o.length&&o[o.length-1]&&o[o.length-1].match(i);if(c){var l=c[1],h={};if(l){var p=this;a(l,function(e,t){p._setParamValue(e,t,h)})}o[o.length-1]=h,e.extend(u,h)}var f=o.length;if(r.splatMatch&&this.encodedSplatParts){if(r.splatMatch<0)return o;f-=1}for(var d=0;d<f;d++)e.isString(o[d])&&(o[d]=n(o[d]),r.paramNames&&r.paramNames.length>=d-1&&(u[r.paramNames[d]]=o[d]));return t.Router.namedParameters||r.namedParameters?[u]:o},_setParamValue:function(e,t,r){e=e.replace("[]",""),e=e.replace("%5B%5D","");for(var n=e.split("."),a=r,i=0;i<n.length;i++){var s=n[i];i===n.length-1?a[s]=this._decodeParamValue(t,a[s]):a=a[s]=a[s]||{}}},_decodeParamValue:function(r,a){var i=t.Router.arrayValueSplit;if(i&&r.indexOf(i)>=0){for(var s=r.split(i),o=s.length-1;o>=0;o--)s[o]?s[o]=n(s[o]):s.splice(o,1);return s}return r=n(r),a?e.isArray(a)?(a.push(r),a):[a,r]:r},toFragment:function(t,n){return n&&(e.isString(n)||(n=r(n)),n&&(t+="?"+n)),t}})});