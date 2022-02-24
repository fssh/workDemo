import Graph from './Graph';
import * as zrender from 'zrender';
import fshUtils from '@/fshUtils';
const { inRect } = fshUtils.game;
export default Graph(
  'polygons',
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
    points,
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
    console.log(
      'points',
      points,
      points.map((p) => map.pointToPixel(p)),
    );
    const zp = new zrender.Polygon({
      style: st,
      shape: {
        points: points.map((p) => {
          const { x, y } = map.pointToPixel(p);
          return [x, y];
        }),
      },
    });
    zp.data = data;

    if (eventMode == 1) {
      onClick && zp.on('click', onClick);
      onMouseDown && zp.on('mousedown', onMouseDown);
      onMouseUp && zp.on('mouseup', onMouseUp);
      onMouseMove && zp.on('mousemove', onMouseMove);
      onMouseOver && zp.on('mouseover', onMouseOver);
      onMouseOut && zp.on('mouseout', onMouseOut);
    } else if (eventMode == 2) {
      zp.mouseIn = false;
      zp.mouseDown = false;
      triggersRef.current.push((e, what) => {
        const { pageX, pageY } = e;
        const newEvent = {
          ...e,
          target: zp,
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
          zp.contain(pageX - x, pageY - y) //这里需要用绝对定位算相对定位
        ) {
          const listen = {
            mousemove: onMouseMove,
            mousedown: onMouseDown,
            mouseup: onMouseUp,
          }[what];
          listen && listen(newEvent);
          if (what == 'mousemove' && !zp.mouseIn) {
            onMouseOver && onMouseOver(newEvent);
            zp.mouseIn = true;
          }
          if (what == 'mousedown' && !zp.mouseDown) {
            zp.mouseDown = true;
          }
          if (what == 'mouseup' && zp.mouseDown) {
            onClick && onClick(newEvent);
            zp.mouseDown = false;
          }
        } else {
          if (what == 'mousemove' && zp.mouseIn) {
            onMouseOut && onMouseOut(newEvent);
            zp.mouseIn = false;
          }
        }
      });
    }

    console.log('polygon zp', zp);
    zr.add(zp);
  },
);
