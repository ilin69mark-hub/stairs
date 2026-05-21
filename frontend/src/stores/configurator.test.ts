import { describe, it, expect, beforeEach } from 'vitest'
import { useConfiguratorStore } from '@/stores/configurator'

describe('useConfiguratorStore', () => {
  beforeEach(() => {
    useConfiguratorStore.getState().reset()
  })

  const defaultValues = {
    type: 'straight',
    floorHeight: 2800,
    openingWidth: 900,
    openingLength: 3500,
    stepWidth: 900,
    material: 'oak',
    railing: 'wood',
    coating: 'varnish-matte',
  }

  it('should have correct initial values', () => {
    const state = useConfiguratorStore.getState()
    expect(state.type).toBe('straight')
    expect(state.floorHeight).toBe(2800)
    expect(state.openingWidth).toBe(900)
    expect(state.openingLength).toBe(3500)
    expect(state.stepWidth).toBe(900)
    expect(state.material).toBe('oak')
    expect(state.railing).toBe('wood')
    expect(state.coating).toBe('varnish-matte')
  })

  it('should set type', () => {
    useConfiguratorStore.getState().setType('l-shaped')
    expect(useConfiguratorStore.getState().type).toBe('l-shaped')
  })

  it('should set floorHeight', () => {
    useConfiguratorStore.getState().setFloorHeight(3200)
    expect(useConfiguratorStore.getState().floorHeight).toBe(3200)
  })

  it('should set openingWidth', () => {
    useConfiguratorStore.getState().setOpeningWidth(1200)
    expect(useConfiguratorStore.getState().openingWidth).toBe(1200)
  })

  it('should set openingLength', () => {
    useConfiguratorStore.getState().setOpeningLength(4000)
    expect(useConfiguratorStore.getState().openingLength).toBe(4000)
  })

  it('should set stepWidth', () => {
    useConfiguratorStore.getState().setStepWidth(1000)
    expect(useConfiguratorStore.getState().stepWidth).toBe(1000)
  })

  it('should set material', () => {
    useConfiguratorStore.getState().setMaterial('pine')
    expect(useConfiguratorStore.getState().material).toBe('pine')
  })

  it('should set railing', () => {
    useConfiguratorStore.getState().setRailing('metal')
    expect(useConfiguratorStore.getState().railing).toBe('metal')
  })

  it('should set coating', () => {
    useConfiguratorStore.getState().setCoating('paint')
    expect(useConfiguratorStore.getState().coating).toBe('paint')
  })

  it('should reset to initial values', () => {
    useConfiguratorStore.getState().setType('U-shaped')
    useConfiguratorStore.getState().setFloorHeight(3500)
    useConfiguratorStore.getState().setMaterial('beech')

    useConfiguratorStore.getState().reset()

    const state = useConfiguratorStore.getState()
    expect(state.type).toBe(defaultValues.type)
    expect(state.floorHeight).toBe(defaultValues.floorHeight)
    expect(state.material).toBe(defaultValues.material)
  })
})