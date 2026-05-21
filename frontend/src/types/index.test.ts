import { describe, it, expect } from 'vitest'
import type {
  StairConfig,
  CalculationResult,
  StepPosition,
  StairType,
  Material,
  Railing,
  Coating,
  CatalogResponse,
  OrderRequest,
  OrderResponse,
  ContactRequest,
  ContactResponse,
} from '@/types'

describe('Types', () => {
  describe('StairConfig', () => {
    it('should have correct shape', () => {
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
      expect(config.type).toBe('straight')
      expect(config.floorHeight).toBe(2800)
    })

    it('should allow optional fields', () => {
      const config: StairConfig = {
        type: 'L-shaped',
        floorHeight: 3000,
        openingWidth: 1000,
        openingLength: 3000,
        stepWidth: 800,
        material: 'pine',
      }
      expect(config.railing).toBeUndefined()
      expect(config.coating).toBeUndefined()
    })
  })

  describe('StepPosition', () => {
    it('should have correct shape', () => {
      const step: StepPosition = {
        index: 0,
        position: [0, 0, 0],
        isWinder: false,
        treadDepth: 250,
        riseHeight: 180,
      }
      expect(step.index).toBe(0)
      expect(step.position).toEqual([0, 0, 0])
    })
  })

  describe('CalculationResult', () => {
    it('should have correct shape', () => {
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
      expect(result.isValid).toBe(true)
      expect(result.totalPrice).toBe(95000)
    })
  })

  describe('StairType', () => {
    it('should have correct shape', () => {
      const stairType: StairType = {
        id: '1',
        slug: 'straight',
        name: 'Прямая',
        workPricePerStep: 2000,
        minHeight: 2000,
        maxHeight: 4000,
        isActive: true,
      }
      expect(stairType.slug).toBe('straight')
    })

    it('should allow optional imageUrl', () => {
      const stairType: StairType = {
        id: '1',
        slug: 'straight',
        name: 'Прямая',
        workPricePerStep: 2000,
        minHeight: 2000,
        maxHeight: 4000,
        isActive: true,
        imageUrl: 'https://example.com/image.jpg',
      }
      expect(stairType.imageUrl).toBe('https://example.com/image.jpg')
    })
  })

  describe('Material', () => {
    it('should have correct shape', () => {
      const material: Material = {
        id: '1',
        slug: 'oak',
        name: 'Дуб',
        type: 'wood',
        pricePerUnit: 15000,
        unit: 'm3',
        isActive: true,
      }
      expect(material.pricePerUnit).toBe(15000)
    })
  })

  describe('Railing', () => {
    it('should have correct shape', () => {
      const railing: Railing = {
        id: '1',
        slug: 'wood',
        name: 'Деревянное',
        pricePerMeter: 5000,
        isActive: true,
      }
      expect(railing.pricePerMeter).toBe(5000)
    })
  })

  describe('Coating', () => {
    it('should have correct shape', () => {
      const coating: Coating = {
        id: '1',
        slug: 'varnish',
        name: 'Лак',
        pricePerM2: 1500,
        isActive: true,
      }
      expect(coating.pricePerM2).toBe(1500)
    })
  })

  describe('CatalogResponse', () => {
    it('should have correct shape', () => {
      const catalog: CatalogResponse = {
        stairTypes: [],
        materials: [],
        railings: [],
        coatings: [],
      }
      expect(Array.isArray(catalog.stairTypes)).toBe(true)
    })
  })

  describe('OrderRequest', () => {
    it('should have correct shape', () => {
      const order: OrderRequest = {
        customerName: 'Иван Иванов',
        customerPhone: '+1234567890',
        customerEmail: 'ivan@example.com',
        customerAddress: 'ул. Примерная 1',
        comment: 'Хочу лестницу',
        stairConfig: {},
      }
      expect(order.customerName).toBe('Иван Иванов')
    })
  })

  describe('OrderResponse', () => {
    it('should have correct shape', () => {
      const response: OrderResponse = {
        orderId: '123',
        orderNumber: 'ORD-001',
        status: 'pending',
      }
      expect(response.orderId).toBe('123')
    })
  })

  describe('ContactRequest', () => {
    it('should have correct shape', () => {
      const contact: ContactRequest = {
        name: 'Тест',
        phone: '+1234567890',
        email: 'test@example.com',
        message: 'Привет',
      }
      expect(contact.name).toBe('Тест')
    })
  })

  describe('ContactResponse', () => {
    it('should have correct shape', () => {
      const response: ContactResponse = {
        status: 'ok',
        id: '456',
      }
      expect(response.status).toBe('ok')
    })
  })
})