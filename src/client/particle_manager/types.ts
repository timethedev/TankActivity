import { Color, Vec2 } from "kaboom"

export interface ParticleData {
    alpha: {
		start: number,
		end: number
	},
	scale: {
		start: number,
		end: number,
	},
	color: {
		start: Color,
		end: Color
	},
	speed: {
		start: number,
		end: number,
	},
	angle: number,
    acceleration: Vec2,
    maxSpeed: number,
    startRotation: number,
    noRotation: boolean,
    rotationSpeed: number,
    lifetime: number,
    pos: Vec2,
    age: number
};

export interface ParticleEffectData {
	alpha: {
		start: number,
		end: number
	},
	scale: {
		start: number,
		end: number,
		minimumScaleMultiplier: number
	},
	color: {
		start: string,
		end: string
	},
	speed: {
		start: number,
		end: number,
		minimumSpeedMultiplier: number
	},
	acceleration: {
		x: number,
		y: number
	},
	maxSpeed: number,
	startRotation: {
		min: number,
		max: number
	},
	noRotation: false,
	rotationSpeed: {
		min: number,
		max: number
	},
	lifetime: {
		min: number,
		max: number
	},
	blendMode: string,
	frequency: number,
	emitterLifetime: number,
	maxParticles: number,
	pos: {
		x: number,
		y: number
	},
	addAtBack: false,
	spawnType: string,
	animationSpeed?: number
}