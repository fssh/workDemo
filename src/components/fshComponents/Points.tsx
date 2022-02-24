import Graph from './Graph';
import * as zrender from 'zrender';
import { destination } from '@turf/turf';
import fshUtils from '@/fshUtils';
const { inRect } = fshUtils.game;
export default Graph(
  'points',
  ({
    randomColors,
    randomColorIndex,
    eventMode,
    zr,
    map,
    canvas,
    triggersRef,
    className,
    image,
    size,
    data,
    onClick,
    onMouseOver,
    onMouseOut,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    pos,
    offset = [0, 0],
    text,
    textFill,
    textOffset,
    fontSize,
  }) => {
    let { x, y } = map.pointToPixel(pos);
    const [ox, oy] = offset;
    const [width, height] = size;
    x -= width / 2;
    y -= height;
    x += ox;
    y += oy;
    const zp = new zrender.Image({
      style: {
        image,
        x,
        y,
        width, //zrender的图片会按宽高缩放
        height,
        text,
        textFill,
        textOffset,
        fontSize,
      },
    });
    zp.pos = pos;
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
        const boundingRect = canvas.getBoundingClientRect();
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

    zr.add(zp);
  },
);
