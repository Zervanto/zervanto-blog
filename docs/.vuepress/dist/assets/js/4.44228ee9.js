(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{570:function(t,i){t.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},571:function(t,i,s){},592:function(t,i,s){var h=s(1),n=s(593);h({global:!0,forced:parseInt!=n},{parseInt:n})},593:function(t,i,s){var h=s(0),n=s(2),l=s(3),a=s(18),o=s(594).trim,e=s(570),r=h.parseInt,u=h.Symbol,c=u&&u.iterator,m=/^[+-]?0x/i,f=l(m.exec),d=8!==r(e+"08")||22!==r(e+"0x16")||c&&!n((function(){r(Object(c))}));t.exports=d?function(t,i){var s=o(a(t));return r(s,i>>>0||(f(m,s)?16:10))}:r},594:function(t,i,s){var h=s(3),n=s(34),l=s(18),a=s(570),o=h("".replace),e="["+a+"]",r=RegExp("^"+e+e+"*"),u=RegExp(e+e+"*$"),c=function(t){return function(i){var s=l(n(i));return 1&t&&(s=o(s,r,"")),2&t&&(s=o(s,u,"")),s}};t.exports={start:c(1),end:c(2),trim:c(3)}},595:function(t,i,s){"use strict";s(571)},619:function(t,i,s){"use strict";s.r(i);s(592);var h={name:"NotFound",data:function(){return{width:12,height:12,tempHeight:14,all:[],bomb:0,num:0,bombNum:10,ifboom:!1,text:"休息一下玩个扫雷吧～",ifbegin:!1}},methods:{click:function(t,i){return this.ifboom?(this.ifboom=!1,void this.randomBegin(20)):1==this.all[t][i][0]?(this.showBomb(),console.log("你踩到雷啦！"),this.text="踩到雷雷了哦，点击再来一次吧。",void(this.ifboom=!0)):(this.ifOk(),void this.andThen(t,i))},andThen:function(t,i){if(this.ifOk(),!(1==this.all[t][i][0]||this.all[t][i][1]>-1)){this.num=0;try{if(1==this.all[t-1][i-1][0]&&(this.num+=1),1==this.all[t-1][i][0]&&(this.num+=1),1==this.all[t-1][i+1][0]&&(this.num+=1),1==this.all[t][i-1][0]&&(this.num+=1),1==this.all[t][i][0])return;if(1==this.all[t][i+1][0]&&(this.num+=1),1==this.all[t+1][i-1][0]&&(this.num+=1),1==this.all[t+1][i][0]&&(this.num+=1),1==this.all[t+1][i+1][0]&&(this.num+=1),this.$set(this.all,t,this.all[t]),this.$set(this.all[t],i,this.all[t][i]),this.$set(this.all[t][i],1,this.num),0!=this.num)return void this.ifOk();this.andThen(t-1,i-1),this.andThen(t-1,i),this.andThen(t-1,i+1),this.andThen(t,i-1),this.andThen(t,i+1),this.andThen(t+1,i-1),this.andThen(t+1,i),this.andThen(t+1,i+1)}catch(t){}this.ifOk()}},randomBegin:function(t){var i=this;this.text="扫雷，准备好了吗？开始咯～",this.bombNum=t,this.bomb=0;for(var s=0;s<this.height;s++)for(var h=0;h<this.width;h++)this.$set(this.all,s,this.all[s]),this.$set(this.all[s],h,this.all[s][h]),this.$set(this.all[s][h],0,0),this.$set(this.all[s][h],1,-1);this.$nextTick((function(){i.random()}))},random:function(){var t,i;t=parseInt(Math.random()*(this.height-2)+1),i=parseInt(Math.random()*(this.width-2)+1),this.bomb<this.bombNum&&(1==this.all[t][i][0]||(this.bomb=this.bomb+1,this.$set(this.all,t,this.all[t]),this.$set(this.all[t],i,this.all[t][i]),this.$set(this.all[t][i],0,1)),this.random())},ifOk:function(){if(this.ifboom)return this.ifboom=!1,void this.randomBegin(20);for(var t=0,i=1;i<this.height-1;i++)for(var s=1;s<this.width-1;s++)-1==this.all[i][s][1]&&(t+=1);t==this.bombNum&&(this.showBomb(),this.ifboom=!0,console.log("完全没有踩到地雷，你好棒棒哦"),this.text="完全没有踩到地雷，你好棒棒哦，还来吗？")},showBomb:function(){for(var t=1;t<this.height-1;t++)for(var i=1;i<this.width-1;i++)-1==this.all[t][i][1]&&1==this.all[t][i][0]&&(this.$set(this.all,t,this.all[t]),this.$set(this.all[t],i,this.all[t][i]),this.$set(this.all[t][i],0,2))},beginMine:function(){this.ifbegin=!0,this.randomBegin(10)}},beforeMount:function(){for(var t=0;t<this.height;t++){this.all[t]=[];for(var i=0;i<this.width;i++)this.all[t][i]=[0,-1]}},mounted:function(){console.log(this.all,"??")}},n=(s(595),s(14)),l=Object(n.a)(h,(function(){var t=this,i=t.$createElement,s=t._self._c||i;return s("div",{staticClass:"mine"},[s("div",{staticClass:"tip"},[t._v("既然来了，就别想回去，留下玩扫雷吧")]),t._v(" "),t.ifbegin?s("div",[t._l(t.height-2,(function(i){return s("div",{directives:[{name:"show",rawName:"v-show",value:t.all.length,expression:"all.length"}],key:i,staticClass:"y"},t._l(t.width-2,(function(h){return s("div",{directives:[{name:"show",rawName:"v-show",value:t.all[i-1],expression:"all[n - 1]"}],key:h,staticClass:"boom",on:{click:function(s){return t.click(i,h)}}},[s("div",{staticClass:"boom-pre",class:{leftout:t.all[i][h][1]>=0,isboom:2==t.all[i][h][0]}}),t._v(" "),s("div",{staticClass:"boom-next",class:{leftin:t.all[i][h][1]>=0,isboom:2==t.all[i][h][0]}},[t._v("\n          "+t._s(0!=t.all[i][h][1]?t.all[i][h][1]:"")+"\n        ")])])})),0)})),t._v(" "),s("div",{staticClass:"tip"},[t._v(t._s(t.text))])],2):s("div",{staticClass:"boom begin",on:{click:t.beginMine}},[s("div",{staticClass:"boom-pre"},[t._v("开始")])])])}),[],!1,null,"6a16d48a",null);i.default=l.exports}}]);