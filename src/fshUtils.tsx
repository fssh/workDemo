import moment from 'moment';
import { Tooltip } from 'antd';
import React, { useEffect, useState, useRef } from 'react';

export default {
  game: {
    inRect(x, y, { x1, x2, y1, y2 }) {
      return x > x1 && x < x2 && y > y1 && y < y2;
    },
  },
  dom: {
    resizeTable(tableContainer, setTableHeight, hasPagination = true) {
      const { current } = tableContainer;
      const $current = $(current);
      //封装成宏任务是为了等表头渲染
      setTimeout(() => {
        setTableHeight(
          $current.height() -
            $current.find('.ant-table-header').height() -
            (hasPagination ? 64 : 0), //页脚高
        );
      });
    },
  },
  hook: {
    usePrev(value) {
      const ref = useRef();
      useEffect(() => {
        ref.current = value;
      });
      return ref.current;
    },
  },
  string: {
    guid() {
      const S4 = () =>
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
    },
    getRandomColor() {
      return (
        '#' +
        ('00000' + ((Math.random() * 0x1000000) << 0).toString(16)).substr(-6)
      );
    },
    normalize(text, s = '-') {
      let res = s;
      if (text != undefined) {
        res = (
          <Tooltip placement="topLeft" title={text}>
            <span>{text}</span>
          </Tooltip>
        );
      }
      return res;
    },
    /**
     * 数字苗条化为字符串
     * @param n 数字
     * @param max 上限
     * @param style 文字样式对象
     * @returns
     */
    svelte(n, max = 90000, style) {
      let res = n;
      const t = parseFloat(n);
      //强转后（可能是去单位了）是数字
      if (Number.isFinite(t)) {
        if (t > max) {
          return (
            <Tooltip placement="topLeft" title={n}>
              <span className="cp" style={style}>
                {max + '+'}
              </span>
            </Tooltip>
          );
        }
      }
      return <span style={style}>{n}</span>;
    },
  },
  number: {
    isOdd(n) {
      console.error(this);
      return n & 1;
    },
    toFixed(n, d = 0) {
      return Number(`${Math.round(`${n}e${d}`)}e-${d}`);
    },
  },
  date: {
    formatDate(date, format = 'YYYY-MM-DD') {
      if (date) {
        return moment(date).format(format);
      } else {
        return date;
      }
    },
  },
  map: {
    location: {
      beijing: [116.3, 39.9],
    },
    loadBMap(type = 'BMapGL', callBack) {
      window.initialize = () => {
        console.log('bmap', window.BMap, window.BMapGL, window.VtxBMapGL);
        callBack && callBack();
        // $.when(
        //   $.getScript(`//api.map.baidu.com/library/TrackAnimation/src/TrackAnimation_min.js`),
        //   $.getScript(`//unpkg.com/mapvgl/dist/mapvgl.min.js`),
        //   $.getScript(`//unpkg.com/mapvgl/dist/mapvgl.threelayers.min.js`),
        //   $.getScript(`//unpkg.com/mapvgl/dist/mapvgl.threelayers.min.js`),
        //   $.getScript(`//api.map.baidu.com/library/LuShu/gl/src/LuShu_min.js`)
        // ).done(() => {
        //   console.error('bmap done', window.BMap, window.BMapGL, window.VtxBMapGL)
        // })
      };
      if (window[type]) {
        window.initialize();
      } else {
        $.getScript(
          {
            BMapGL: `//api.map.baidu.com/api?type=webgl&v=1.0&ak=42IughV5lDxAt0wI8AhDVuGR&callback=initialize`,
            BMap2: `//api.map.baidu.com/api?v=2.0&ak=42IughV5lDxAt0wI8AhDVuGR&callback=initialize`,
            BMap3: `//api.map.baidu.com/api?v=3.0&ak=42IughV5lDxAt0wI8AhDVuGR&callback=initialize`,
          }[type],
        );
      }
    },
  },
  business: {
    /**
     * 找子树
     * @param orgTree 组织架构树
     * @param parentId 父节点id
     * @returns
     */
    getListByOrgtree(orgTree: Object, parentId) {
      let res = false; //默认没找到
      if (orgTree) {
        if (parentId == orgTree.id) {
          res = orgTree.children;
        } else if (orgTree.children) {
          orgTree.children.some(
            (child) => (res = this.getListByOrgtree(child, parentId)),
          );
        }
      }
      return res;
    },
    /**
     *
     * @param orgTree 组织架构树
     * @param disabledLevels 禁用哪级（级别从0开始）
     * @param showLevel 显示到哪级，传null会显示所有
     * @param filterCpys 显示哪些公司，传null会显示所有
     * @returns treeData:[]
     */
    getTreeDataByOrgtree(
      orgTree: Object,
      disabledLevels: [int] = [],
      showLevel: any,
      filterCpys: [{}] = null,
      ignoreDisabled: [int] = [], //哪些级强制不管返回的disabled,以disabledLevels为准
    ): Array {
      const normalize = (orgTree, currentLevel = 0) => {
        let res;
        if (currentLevel <= showLevel || showLevel == undefined) {
          const {
            id: key,
            name: title,
            nodeType,
            children,
            disabled,
          } = orgTree;
          res = {
            key,
            title,
            value: key,
            nodeType,
            children:
              currentLevel == showLevel
                ? []
                : children?.map((c) => normalize(c, currentLevel + 1)),
            disabled: ignoreDisabled.includes(currentLevel)
              ? //忽略后台的权限直接看前台是否要显示（例如树状的使用单位需要用这个）
                disabledLevels.includes(currentLevel)
              : //默认先看后台是否有权限，后台有权限再看前台是否要显示
              disabled
              ? true
              : disabledLevels.includes(currentLevel),
          };
        }
        return res;
      };
      let res = [];
      if (typeof orgTree == 'object') {
        let normalized = normalize(
          (() => {
            const { children } = orgTree;
            return {
              ...orgTree,
              children: filterCpys
                ? children.filter((c) =>
                    filterCpys.map((v) => v.value).includes(c.id),
                  )
                : children,
            };
          })(),
        );
        normalized?.children?.length && (res = [normalized]);
      }
      console.log('res', res);
      return res;
    },
    /**
     * 通过id获取节点类型（是使用单位还是部门）
     * @param orgTree
     * @param id
     */
    getNodeTypeById(orgTree, id) {
      let res = false; //默认没找到
      if (orgTree) {
        if (id == orgTree.id) {
          res = orgTree.nodeType;
        } else if (orgTree.children) {
          orgTree.children.some(
            (child) => (res = this.getNodeTypeById(child, id)),
          );
        }
      }
      return res;
    }
  },
};
