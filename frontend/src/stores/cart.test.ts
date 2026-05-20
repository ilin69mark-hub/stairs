import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/stores/cart'
import type { StairConfig, CalculationResult } from '@/types'

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('should have initial null values', () => {
    const state = useCartStore.getState()
    expect(state.currentConfig).toBeNull()
    expect(state.calculatedResult).toBeNull()
  })

  it('should set config', () => {
    const config: StairConfig = {
      type: 'straight',
      floorHeight: 2800,
      openingWidth: 900,
      openingLength: 3500,
      stepWidth: 900,
      material: 'oak',
      railing: 'wood',
      coating: 'varnish',
    }

    useCartStore.getState().setConfig(config)

    expect(useCartStore.getState().currentConfig).toEqual(config)
  })

  it('should set result', () => {
    const result: CalculationResult = {
      steps: [],
      totalSteps: 15,
      inclination: 35,
      isValid: true,
      materialCost: 50000,
      workCost: 30000,
      railingCost: 10000,
      coatingCost: 5000,
      totalPrice: 95000,
    }

    useCartStore.getState().setResult(result)

    expect(useCartStore.getState().calculatedResult).toEqual(result)
  })

  it('should clear cart', () => {
    const config: StairConfig = {
      type: 'straight',
      floorHeight: 2800,
      openingWidth: 900,
      openingLength: 3500,
      stepWidth: 900,
      material: 'oak',
    }

    const result: CalculationResult = {
      steps: [],
      totalSteps: 15,
      inclination: 35,
      isValid: true,
      materialCost: 50000,
      workCost: 30000,
      railingCost: 10000,
      coatingCost: 5000,
      totalPrice: 95000,
    }

    useCartStore.getState().setConfig(config)
    useCartStore.getState().setResult(result)
    useCartStore.getState().clearCart()

    const state = useCartStore.getState()
    expect(state.currentConfig).toBeNull()
    expect(state.calculatedResult).toBeNull()
  })
})