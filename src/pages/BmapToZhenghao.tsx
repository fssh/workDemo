import Map from '@/components/fshComponents/Map';
import fshUtils from '@/fshUtils';
import { useEffect, useState } from 'react';
import { Card } from 'antd';
import styles from './BMapToZhenghao.less';

const { location } = fshUtils.map;
const { beijing } = location;
const center = new BMap.Point(...beijing);

const mapTypeControl = new BMap.MapTypeControl({
	anchor: BMAP_ANCHOR_TOP_LEFT,
	mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP],
});
const navigationControl = new BMap.NavigationControl({
	anchor: BMAP_ANCHOR_TOP_LEFT,
	offset: new BMap.Size(10, 60),
});
const overviewMapControl = new BMap.OverviewMapControl({
	anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
	size: new BMap.Size(88, 88),
	offset: new BMap.Size(10, 10),
	isOpen: true,
});
const scaleControl = new BMap.ScaleControl({
	anchor: BMAP_ANCHOR_BOTTOM_LEFT,
	offset: new BMap.Size(10, 10),
});
const geolocationControl = new BMap.GeolocationControl({
	anchor: BMAP_ANCHOR_BOTTOM_LEFT,
	offset: new BMap.Size(10, 40),
});

let drawingManager;
let overlay, drawingMode;
let map;
const useMap = () => {
	const [info, setInfo] = useState();
	useEffect(() => {
		const getPos = () =>
			overlay.getPath()
				.map(
					({ lng, lat }) => `${lng},${lat}`
				)
				.join(';');
		const lineupdate = e => {
			console.log('lineupdate', e, BMapLib.GeoUtils.getPolygonArea(overlay));
			setInfo(getPos());
		};
		const overlaycomplete = e => {
			console.log('overlaycomplete', e, e.calculate);
			({ overlay, drawingMode } = e);
			drawingManager.close();//必须关闭绘图模式，不然无法编辑
			overlay.enableEditing?.();
			overlay?.addEventListener('lineupdate', lineupdate);

			let info;
			if (drawingMode == 'marker') {
				const { lng, lat } = overlay.getPosition();
				info = `${lng},${lat}`;
			}
			else {
				info=getPos();
			}
			setInfo(info);
		}
		if (map) {
			const options = {
				strokeColor: 'rgb(249, 165, 47)',
				fillColor: 'rgb(249, 165, 47)',
				strokeWeight: 2,
				strokeOpacity: 1,
				fillOpacity: 0.5,
				strokeStyle: 'solid',
			};
			drawingManager = new BMapLib.DrawingManager(map, {
				// isOpen: true, //是否开启绘制模式
				enableDrawingTool: true, //是否显示工具栏
				enableCalculate: true, //是否计算面积和距离，圆是计算面积
				drawingToolOptions: {
					anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
					// offset: new BMap.Size(map.getSize().width / 2, 5), //偏离值
				},
				circleOptions: options, //圆的样式
				polylineOptions: options, //线的样式
				polygonOptions: options, //多边形的样式
				rectangleOptions: options, //矩形的样式
			});
			drawingManager.addEventListener('overlaycomplete', overlaycomplete);
		}
		return () => {
			drawingManager?.removeEventListener('overlaycomplete', overlaycomplete);
			overlay?.removeEventListener('lineupdate', lineupdate);

		};
	}, [map]);
	return [info, setInfo];
}

export default props => {
	const [info, setInfo] = useMap(map);
	const mapProps = {
		ref(ref) {
			if (ref?.map) {
				map = ref.map;
				map.removeControl(navigationControl);
				map.addControl(navigationControl);
				map.removeControl(mapTypeControl);
				map.addControl(mapTypeControl);
				map.removeControl(overviewMapControl);
				map.addControl(overviewMapControl);
				map.removeControl(scaleControl);
				map.addControl(scaleControl);
				map.removeControl(geolocationControl);
				map.addControl(geolocationControl);
			}
		},
		className: styles.map,
		style: { width: '100%', boxShadow: '0 0 20px rgba(0,0,0,0.2)' },
		zoom: 10,
		center,
		enableScrollWheelZoom: true,
		autoViewport: true,
		// viewport: points ? .filter(p => p ? .pos ? .lng).map(p => p.pos),
	};

	const cardProps = {
		className: styles.infoCard,
		style: {
			position: 'absolute',
			top: 0,
			left: '25%',
			width: '50%',
			background: 'rgba(255,255,255,0.8)',
			borderRadius: '0 0 10px 10px'
		}
	}

	return (
		<Map {...mapProps}>
			<Card {...cardProps}>
				{info ? `坐标：${info}` : '请先画图，然后这里会显示坐标（只显示最后一次修改的图形的坐标）！'}
			</Card>
		</Map>
	);
}