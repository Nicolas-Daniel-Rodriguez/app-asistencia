if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const d=e=>i(e,t),f={module:{uri:t},exports:o,require:d};s[t]=Promise.all(n.map((e=>f[e]||d(e)))).then((e=>(r(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index--Vr--u0m.js",revision:null},{url:"assets/index-DdheT69F.css",revision:null},{url:"index.html",revision:"8035e6d6e4495b933b73583ff9349fe6"},{url:"registerSW.js",revision:"f4c42ae30f785ee8f24adad8b0a026d0"},{url:"manifest.webmanifest",revision:"e0a47df4b3fc997186a9269dddce0fb9"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
