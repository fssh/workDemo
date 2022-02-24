import Graph from './Graph';
import * as zrender from 'zrender';
import { destination } from '@turf/turf';
import fshUtils from '@/fshUtils';
const { inRect } = fshUtils.game;
export default Graph(
  'rects',
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
    width,
    height,
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
    const { x, y } = map.pointToPixel(pos);

    const d1 = destination([lng, lat], width / 1000, 90, { units: 'kilometers' });
    const d2 = destination([lng, lat], height / 1000, 180, { units: 'kilometers' });

    const { x:x1, y:y1 } = map.pointToPixel(
      new BMap.Point(...d1.geometry.coordinates),
    );
    const { x:x2, y:y2 } = map.pointToPixel(
      new BMap.Point(...d2.geometry.coordinates),
    );

    console.log('目标点',lng,lat,x1,y1,x2,y2)

    const zc = new zrender.Rect({
      style: st,
      shape: {
        x,
        y,
        width:x1-x,
        height:y2-y
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

    console.log('rect zc', zc);
    zr.add(zc);
  },
);
