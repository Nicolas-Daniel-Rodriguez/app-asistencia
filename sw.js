if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const d=e=>s(e,o),f={module:{uri:o},exports:t,require:d};i[o]=Promise.all(n.map((e=>f[e]||d(e)))).then((e=>(r(...e),t)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-AiHhCOSo.js",revision:null},{url:"assets/index-DPZrI1Gh.css",revision:null},{url:"index.html",revision:"c1b714f3c73f4c2418e153d2358ea334"},{url:"registerSW.js",revision:"f4c42ae30f785ee8f24adad8b0a026d0"},{url:"AS-Logo-192.png",revision:"de5e7685691bbc0f2da5a80346fc7b61"},{url:"AS-Logo-512.png",revision:"8e40e88d9af75990f62bd9cfdc270cad"},{url:"manifest.webmanifest",revision:"46e424e4f8e97aee97a4de8373cab45a"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
