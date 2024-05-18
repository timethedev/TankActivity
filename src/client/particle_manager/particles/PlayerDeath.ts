import { ParticleEffectData } from "../types"

const DeathParticleData: ParticleEffectData = {
	"alpha": {
		"start": 1,
		"end": 0.9
	},
	"scale": {
		"start": 0.4,
		"end": 0.3,
		"minimumScaleMultiplier": 0
	},
	"color": {
		"start": "#ff002e",
		"end": "#f3003e"
	},
	"speed": {
		"start": 200,
		"end": 100,
		"minimumSpeedMultiplier": 	1.5
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": -15,
		"max": 15
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 0.12,
		"max": 0.3
	},
	"blendMode": "normal",
	"frequency": 0.001,
	"emitterLifetime": 0.1,
	"maxParticles": 30,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point",
	"animationSpeed": 2
}

export default DeathParticleData;