import { Color, DrawCircleOpt, RenderProps, Vec2 } from "kaboom"
import { ParticleData, ParticleEffectData } from "./types"


function averageFromPercentage(percentage: number, min: number, max: number) {
	return percentage * (max - min) + min;
}

function averageColorFromPercentage(percentage: number, min: Color, max: Color) {
	return rgb(
		averageFromPercentage(percentage, min.r, max.r),
		averageFromPercentage(percentage, min.g, max.g),
		averageFromPercentage(percentage, min.b, max.b),
	)
}

export class Particle {
	private data: ParticleData;

	constructor(opts: ParticleEffectData, position: Vec2, angle: number) {
		const scaleMultiplier: number = rand(opts.scale.minimumScaleMultiplier, 1);
		const speedMultiplier: number = rand(opts.speed.minimumSpeedMultiplier, 1);

		const scaleStart: number = opts.scale.start * scaleMultiplier;
		const scaleEnd: number = opts.scale.end * scaleMultiplier;
		const speedStart: number = opts.speed.start * speedMultiplier;
		const speedEnd: number = opts.speed.end * speedMultiplier;
		
		const startRotation: number = rand(opts.startRotation.min, opts.startRotation.max);
		const rotationSpeed: number = rand(opts.rotationSpeed.min, opts.rotationSpeed.max);
		const lifetime: number = rand(opts.lifetime.min, opts.lifetime.max);


		this.data = {
			alpha: opts.alpha,
			scale: { start: scaleStart, end: scaleEnd },
			color: { start: rgb(opts.color.start), end: rgb(opts.color.end) },
			speed: { start: speedStart, end: speedEnd },
			angle: angle,
			acceleration: vec2(opts.acceleration.x, opts.acceleration.y),
			maxSpeed: opts.maxSpeed,
			startRotation: startRotation + angle,
			noRotation: opts.noRotation,
			rotationSpeed: rotationSpeed,
			lifetime: lifetime,
			pos: position,
			age: 0
		};
	}

	update(animationSpeed: number): void {
		const playedAnimPercentage: number = this.data.age / this.data.lifetime;

		// Position
		const startPosition: Vec2 = this.data.pos;
		const startRotation: number = deg2rad(this.data.startRotation - 180);

		const directionVector: Vec2 = vec2(Math.cos(startRotation), Math.sin(startRotation));
		const speed = averageFromPercentage(playedAnimPercentage, this.data.speed.start, this.data.speed.end) / 100 * animationSpeed;
		const velocity: Vec2 = directionVector.scale(speed * dt() * 100).add(this.data.acceleration.scale(dt() * 100));

		const endPosition: Vec2 = startPosition.add(velocity);
		this.data.pos = endPosition;

		// Angle
		const angle = rad2deg(Math.atan2(directionVector.y, directionVector.x)) + 90;
		this.data.angle = angle;

		// Color
		const color = averageColorFromPercentage(playedAnimPercentage, this.data.color.start, this.data.color.end);
		this.data.color.start = color;

		// Scale
		const scale = averageFromPercentage(playedAnimPercentage, this.data.scale.start, this.data.scale.end);
		this.data.scale.start = scale;

		// Speed
		const alpha = averageFromPercentage(playedAnimPercentage, this.data.alpha.start, this.data.alpha.end);
		this.data.alpha.start = alpha;

		// Age
		this.data.age += dt() / 5 * animationSpeed;
	}

	isDead(): boolean {
		return this.data.age >= this.data.lifetime;
	}

	getRenderData(): DrawCircleOpt {
		const data = this.data;

		return {
			radius: data.scale.start * 40,
			pos: data.pos,
			color: data.color.start,
			opacity: data.alpha.start
		}
	}
}



interface EmitterData {
	position: Vec2,
	angle: number
}

export default class ParticleEffect {
	particles: Particle[] = [];
	effectData: ParticleEffectData;
	emitterData: EmitterData;

	constructor(effectData: ParticleEffectData, opts: EmitterData) {
		this.effectData = effectData;
		this.effectData.animationSpeed = this.effectData.animationSpeed ?? 1
		this.emitterData = opts;
	}


	emit(): void {
		const effectData = this.effectData
		const maxParticles = effectData.maxParticles;

		for (let i = 0; i < maxParticles; i++) {
			const particle = new Particle(effectData, this.emitterData.position, this.emitterData.angle);
			this.particles.push(particle);
		}
	}

	update(): void {
		const Particles = this.particles;
		Particles.forEach((particle: Particle, index: number) =>{
			if (particle.isDead()) {
				this.particles.splice(index, 1);
				return;
			}

			particle.update(this.effectData.animationSpeed!);
		})
	}

	render(): void {
		const Particles = this.particles;

		this.update();
		Particles.forEach((particle: Particle) =>{
			const RenderData = particle.getRenderData();
			drawCircle(RenderData);
		})
	}
}