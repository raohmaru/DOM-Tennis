import Signal from './signal.js';

export default class Physics {
	constructor(cfg) {
		this._cfg = cfg;
		this._objects = [];
	}

	addBoundingBox(bbox) {
		this._bbox = bbox;
	}

	addObject(obj) {
		this._objects.push(obj);
		obj.yvel     = 0;
		obj.xvel     = 0;
		obj.onCollision = new Signal();
	}

	update() {
		let obj;
		const cfg = this._cfg,
			bbox = this._bbox;

		for (let i = 0; i < this._objects.length; i++) {
			obj = this._objects[i];

			obj.yvel += cfg.gravity;
			if (obj.bottom + obj.yvel > bbox.bottom) {
				obj.yvel -= cfg.gravity;
				obj.yvel *= -cfg.groundFriction;
				if (obj.yvel) {
					obj.onCollision.emit(obj, 'bbox:bottom');
				}
				if (obj.yvel > -cfg.vSpeedThreshold) {
					obj.y = bbox.bottom - obj.height;
					obj.freeFall = false;
					obj.yvel = 0;
				}
			}
			obj.y += obj.yvel;

			obj.xvel *= cfg.drag;
			obj.x += obj.xvel;
			if (obj.x < bbox.left) {
				obj.x += bbox.left - obj.x;
				obj.xvel *= -cfg.wallFriction;
				obj.onCollision.emit(obj, 'bbox:left');
			} else if (obj.right > bbox.right) {
				obj.x -= obj.right - bbox.right;
				obj.xvel *= -cfg.wallFriction;
				obj.onCollision.emit(obj, 'bbox:right');
			}
			if (Math.abs(obj.xvel) < cfg.hSpeedThreshold) {
				obj.xvel = 0;
			}

			if (obj.xvel !== 0) {
				obj.rotation += obj.xvel * 2;
			}
		}
	}
}
