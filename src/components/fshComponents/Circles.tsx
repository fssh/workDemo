import Graph from './Graph';
import * as zrender from 'zrender';
import { destination } from '@turf/turf';
import fshUtils from '@/fshUtils';
const { inRect } = fshUtils.game;
export default Graph(
  'circles',
  ({
    randomColors,
    randomColorIndex,
    eventMode,
    zr,
    map,
    canvas,
    triggersRef,
    data,
    style,
    pos,
    r,
    onClick,
    onMouseOver,
    onMouseOut,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    i,
  }) => {
    const st = {
      fill: 'none',
      stroke: 'red',
      lineWidth: 10,
      lineCap: 'round',
      ...style,
    };
    const { lng, lat } = pos;
    const { x: cx, y: cy } = map.pointToPixel(pos);

    const d = destination([lng, lat], r / 1000, 90, { units: 'kilometers' });
    // console.log('源点',cx,cy)
    // console.log('目标点',map.pointToPixel(new BMap.Point(...d.geometry.coordinates)))
    const { x, y } = map.pointToPixel(
      new BMap.Point(...d.geometry.coordinates),
    );

    const zc = new zrender.Circle({
      style: st,
      shape: {
        cx,
        cy,
        r: Math.abs(x - cx),
      },
    });
    zc.data = data;

    if (eventMode == 1) {
      onClick && zc.on('click', onClick);
      onMouseDown && zc.on('mousedown', onMouseDown);
      onMouseUp && zc.on('mouseup', onMouseUp);
      onMouseMove && zc.on('mousemove', onMouseMove);
      onMouseOver && zc.on('mouseover', onMouseOver);
      onMouseOut && zc.on('mouseout', onMouseOut);
    } else if (eventMode == 2) {
      zc.mouseIn = false;
      zc.mouseDown = false;
      triggersRef.current.push((e, what) => {
        const { pageX, pageY } = e;
        const newEvent = {
          ...e,
          target: zc,
        };
        // console.log('eeeee',e,e.target,e.offsetX,e.offsetY)
        const boundingRect = canvas.getBoundingClientRect();
        // console.log('boundingRect',boundingRect)
        let { x, y, width, height } = boundingRect;
        x += window.pageXOffset;
        y += window.pageYOffset;
        if (
          inRect(pageX, pageY, {
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height,
          }) &&
          zc.contain(pageX - x, pageY - y) //这里需要用绝对定位算相对定位
        ) {
          const listen = {
            mousemove: onMouseMove,
            mousedown: onMouseDown,
            mouseup: onMouseUp,
          }[what];
          listen && listen(newEvent);
          if (what == 'mousemove' && !zc.mouseIn) {
            onMouseOver && onMouseOver(newEvent);
            zc.mouseIn = true;
          }
          if (what == 'mousedown' && !zc.mouseDown) {
            zc.mouseDown = true;
          }
          if (what == 'mouseup' && zc.mouseDown) {
            onClick && onClick(newEvent);
            zc.mouseDown = false;
          }
        } else {
          if (what == 'mousemove' && zc.mouseIn) {
            onMouseOut && onMouseOut(newEvent);
            zc.mouseIn = false;
          }
        }
      });
    }

    console.log('circle zc', zc);
    zr.add(zc);
  },
);
