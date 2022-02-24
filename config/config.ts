// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  headScripts: [
    {
      src: `./resources/js/jquery.min.js`
    },
    // {
    //   src: `https://api.map.baidu.com/api?v=2.0&ak=42IughV5lDxAt0wI8AhDVuGR`
    // },
    {
      src: `https://api.map.baidu.com/api?v=3.0&ak=42IughV5lDxAt0wI8AhDVuGR`//注意bmap的任何两个版本之间都不能混用，样式有冲突
    },
    // {
    //   src:'https://api.map.baidu.com/api?type=webgl&v=1.0&ak=42IughV5lDxAt0wI8AhDVuGR'
    // },
    {
      src:"//api.map.baidu.com/library/TrackAnimation/src/TrackAnimation_min.js"
    },
    {
      src:"//api.map.baidu.com/library/AreaRestriction/1.2/src/AreaRestriction_min.js"
    },
    {
      src:'//api.map.baidu.com/library/CurveLine/1.5/src/CurveLine.min.js'
    },
    {
      src:'//api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js'
    },
    {
      src:'//api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js'
    },
    {
      src:'//api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js'
    },
    {
      src:'//api.map.baidu.com/library/LuShu/1.2/src/LuShu_min.js'
    },
    {
      src:'//api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js'
    },
    {
      src:"https://webapi.amap.com/loader.js"
    }
  ],
  links: [
  { rel: 'stylesheet', href: `./resources/printJS.css` },
  { rel: 'stylesheet', href: `//api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css` },
  ],
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'root-entry-name': 'variable',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: { type: 'none' },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
});
