import { ParticleEffectData } from "./../types"

const ParticleEffect: ParticleEffectData = {
	"alpha": {
		"start": 1,
		"end": 0.9
	},
	"scale": {
		"start": 0.4,
		"end": 0.1,
		"minimumScaleMultiplier": 1.5
	},
	"color": {
		"start": "#77FF00",
		"end": "#9000FF"
	},
	"speed": {
		"start": 200,
		"end": 50,
		"minimumSpeedMultiplier": 1.1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 360
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 0.05,
		"max": 0.6
	},
	"blendMode": "normal",
	"frequency": 0.001,
	"emitterLifetime": 0.1,
	"maxParticles": 50,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point",
	"animationSpeed": 2
}

export default ParticleEffect