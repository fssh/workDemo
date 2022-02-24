import Graph from './Graph';
import * as zrender from 'zrender';
import { destination } from '@turf/turf';
import fshUtils from '@/fshUtils';
const { string, game } = fshUtils;
const { getRandomColor } = string;
const { inRect } = game;
export default Graph(
  'paths',
  ({
    offset = [0, 0],
    randomColors,
    randomColorIndex,
    eventMode,
    zr,
    map,
    canvas,
    triggersRef,
    data,
    style,
    path,
    slice,
    onClick,
    onMouseOver,
    onMouseOut,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    i,
  }) => {
    if (path?.length) {
      const [dx, dy] = offset;
      const st = {
        fill: 'none',
        lineWidth: 10,
        lineCap: 'round',
        ...style,
      };
      if (slice) {
        path.reduce((a, b, j) => {
          const { x: bx, y: by } = map.pointToPixel(a);
          const { x: ex, y: ey } = map.pointToPixel(b);
          const d = `M${bx + dx} ${by + dy} ${ex + dx} ${ey + dy}`;
          if (!st.stroke) {
            const { current } = randomColorIndex;
            const color = randomColors.current?.[current];
            if (color) {
              st.stroke = color;
            } else {
              st.stroke = randomColors.current[current] = getRandomColor();
            }
            randomColorIndex.current++;
          }
          const zp = new zrender.Path(
            zrender.path.createFromString(d, {
              style: st,
              // draggable: true
            }),
          );
          zp.data = data instanceof Array ? data[j - 1] : data; //分段数据最好传数组

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
          return b;
        });
      } else {
        const d =
          'M' +
          path.map((point) => {
            const { x, y } = map.pointToPixel(point);
            return `${x + dx} ${y + dy}`;
          });
        if (!st.stroke) {
          const { current } = randomColorIndex;
          const color = randomColors.current?.[current];
          if (color) {
            st.stroke = color;
          } else {
            st.stroke = randomColors.current[current] = getRandomColor();
          }
          randomColorIndex.current++;
        }
        const zp = new zrender.Path(
          zrender.path.createFromString(d, {
            style: st,
            // draggable: true
          }),
        );
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
      }
    }
  },
);
