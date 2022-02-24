//请与bmap-react配合食用
import { useEffect, useRef } from 'react';
import * as zrender from 'zrender';
import { destination } from '@turf/turf';
import fshUtils from '@/fshUtils';
const { string } = fshUtils;
const { guid, getRandomColor } = string;
const initColor = [
  '#38D5C6',
  '#2980F6',
  'violet',
  'tomato',
  'chocolate',
  'gold',
];

export default (type, update) => (props) => {
  const {
    map,
    zIndex = 1, //canvas堆叠
    eventMode = 1, //事件模式，0不支持事件，1支持单层事件，2支持事件渗透
  } = props;
  const graphs = props[type];
  let randomColors = useRef([...initColor]); //随机颜色数组
  const classNameRef = useRef(`${type}CanvasLayer_` + guid());
  const className = classNameRef.current;
  const zrRef = useRef(); //组件与zrender实例是一一对应的
  const triggersRef = useRef([]);
  const onDocMouseDown = (e) => {
    let { current: triggers } = triggersRef;
    triggers.forEach((trigger) => {
      trigger(e, 'mousedown');
    });
  };
  const onDocMouseUp = (e) => {
    let { current: triggers } = triggersRef;
    triggers.forEach((trigger) => {
      trigger(e, 'mouseup');
    });
  };
  const onDocMouseMove = (e) => {
    let { current: triggers } = triggersRef;
    triggers.forEach((trigger) => {
      trigger(e, 'mousemove');
    });
  };
  console.log(`${type} props`, props, className);

  useEffect(() => {
    if (eventMode == 2) {
      document.addEventListener('mousedown', onDocMouseDown);
      document.addEventListener('mouseup', onDocMouseUp);
      document.addEventListener('mousemove', onDocMouseMove);
    }
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('mouseup', onDocMouseUp);
      document.removeEventListener('mousemove', onDocMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvasLayer = new BMap.CanvasLayer({
      paneName: 'mapPane',
      update() {
        const { canvas } = this;
        canvas.style.zIndex = zIndex;
        if (map && graphs?.length > 0) {
          triggersRef.current = [];
          canvas.width = map.width;
          canvas.height = map.height;
          canvas.className = className;
          //zrender实现
          let { current: zr } = zrRef;
          zr && zrender.dispose(zr);
          // if (!zr) {
          //不要重复init，会内存泄漏
          zr = zrRef.current = zrender.init(canvas); //因为地图可能会刷新，这里只能重新生成zrender实例
          // } else {
          //   zr.clear();
          // }

          const randomColorIndex = { current: 0 };
          graphs.forEach((graph, i) =>
            update({
              randomColors,
              eventMode,
              zr,
              map,
              canvas,
              triggersRef,
              className,
              ...graph,
              i,
              randomColorIndex,
            }),
          );
        }
      },
    });
    canvasLayer.class = className;
    map?.getOverlays().forEach((v) => {
      if (v.class == className) {
        map.removeOverlay(v);
      }
    });
    console.log(`render ${type}`, graphs, canvasLayer);
    map?.addOverlay(canvasLayer);

    return () => {
      let { current: zr } = zrRef;
      zr && zrender.dispose(zr);
      zr = zrRef.current = null;
      randomColors.current = [...initColor];
      map?.getOverlays().forEach((v) => {
        if (v.class == className) {
          map.removeOverlay(v);
        }
      });
    };
  }, [map, graphs]);

  return null;
};
