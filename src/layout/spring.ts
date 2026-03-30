export interface SpringConfig {
  mass?: number
  stiffness?: number
  damping?: number
  target?: number
  value?: number
  velocity?: number
  precision?: number
}

export interface SpringState {
  value: number
  velocity: number
  target: number
}

export interface Spring extends SpringState {
  setTarget(nextTarget: number): void
  snapTo(nextValue: number): void
  update(dt: number): SpringState
  isAtRest(): boolean
}

export function createSpring(config: SpringConfig = {}): Spring {
  const {
    mass = 1,
    stiffness = 170,
    damping = 26,
    target = 0,
    value = target,
    velocity = 0,
    precision = 0.001,
  } = config

  let currentValue = value
  let currentVelocity = velocity
  let currentTarget = target

  return {
    get value() {
      return currentValue
    },
    get velocity() {
      return currentVelocity
    },
    get target() {
      return currentTarget
    },
    setTarget(nextTarget: number) {
      currentTarget = nextTarget
    },
    snapTo(nextValue: number) {
      currentValue = nextValue
      currentVelocity = 0
      currentTarget = nextValue
    },
    update(dt: number) {
      const step = Math.max(dt, 0)
      const displacement = currentTarget - currentValue
      const springForce = displacement * stiffness
      const dampingForce = currentVelocity * damping
      const acceleration = (springForce - dampingForce) / mass

      currentVelocity += acceleration * step
      currentValue += currentVelocity * step

      if (Math.abs(currentTarget - currentValue) < precision && Math.abs(currentVelocity) < precision) {
        currentValue = currentTarget
        currentVelocity = 0
      }

      return {
        value: currentValue,
        velocity: currentVelocity,
        target: currentTarget,
      }
    },
    isAtRest() {
      return Math.abs(currentTarget - currentValue) < precision && Math.abs(currentVelocity) < precision
    },
  }
}
