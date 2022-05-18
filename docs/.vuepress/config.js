// .vuepress/config.js
module.exports = {
  title: 'Zervanto', //网站名称
  description: '用心写代码，不辜负程序员之名', //网站描述
  //head标签
  head: [
    ['link', { rel: 'stylesheet', href: '/img/logo.ico' }], //注意"/"就是public资源目录。标签的logo
    ['script', { src: 'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js' }],
  ],
  themeConfig: {
    author: 'tinger',
    // headImg: 'https://yating.online/res/img/yating.jpg', //选填：头像
    //导航栏
    nav: [
      { text: '主页', link: '/' },
      { text: '目录', link: '/config/catalog' },
      { text: '项目列表', link: '/config/about' },
      { text: 'Github', type: 'url', link: 'https://github.com/Zervanto' },
    ],
    catalogUrl: '/catalog', //必填 目录路径
    lastUpdated: 'Last Updated', //必填：文章显示最新修改时间
    smoothScroll: true, //选填
    //选填/live2d模型路径
    live2dModel: '/live2d/model/poi/poi.model.json',
    pageNum: 5, //选填：目录每页显示条数
    gitalk: {
      //选填：gitalk留言设置
      clientID: '5b8613cfe15e02db85b7',
      clientSecret: 'd4129094c33b8da73e873470fb89aea53dfaf396',
      repo: 'Chenyating.github.io',
      owner: 'chenyating',
      admin: ['Chenyating'],
      distractionFreeMode: false, // Facebook-like distraction free mode
    },
    // footer: '粤ICP备案号：18150247号', //选填
  },
  theme: 'ting', //必填：使用vuepress-theme-ting 主题
};
