import { Map } from 'react-bmap';
import { useEffect, useRef, forwardRef, Children, cloneElement } from 'react';
import fshUtils from '@/fshUtils';
import _ from 'lodash';
import { useState } from 'react';
const { hook } = fshUtils;
const { usePrev } = hook;

export default forwardRef((props, ref) => {
  const {
    children,
    viewport,
    flash, //默认对视口进行深比较刷新，但有些业务场景可能需要一直刷新，请设flash为true
  } = props;
  const map = useRef();
  const renderedChildren = useRef();
  const getRenderedChildren = (children) => {
    return Children.map(children, (child) => {
      if (!child) {
        return;
      }

      if (typeof child.type === 'string') {
        //这块照react-bmap抄的
        return child;
      } else if (child.type == Symbol.for('react.fragment')) {
        return <>{getRenderedChildren(child.props.children)}</>;
      } else {
        return cloneElement(child, {
          map: map.current,
        });
      }
    });
  };
  console.log('red', renderedChildren);
  const refFunc = (r) => {
    console.log('map ref', r, <div />);
    if (r?.map) {
      map.current = r.map;
    }
    ref && ref(r);
  };

  const preViewport = usePrev(viewport);
  useEffect(() => {
    console.log('setViewport');
    if (flash || !_.isEqual(preViewport, viewport)) {
      map.current?.setViewport(viewport);
    }
  }, [viewport]);

  return (
    <Map {...props} ref={refFunc}>
      {getRenderedChildren(children)}
    </Map>
  );
});
