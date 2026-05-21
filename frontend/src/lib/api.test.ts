import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateStair, getCatalog, createOrder, submitContact, ApiError } from '@/lib/api'

const mockFetch = vi.fn()
global.fetch = mockFetch as typeof fetch

describe('API', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('calculateStair', () => {
    it('should return calculation result on success', async () => {
      const mockResult = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })

      const config = { type: 'straight', floorHeight: 2800, openingWidth: 900, openingLength: 3500, stepWidth: 900, material: 'oak' }
      const result = await calculateStair(config)

      expect(result).toEqual(mockResult)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/calculate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(config),
        })
      )
    })

    it('should throw ApiError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      })

      await expect(calculateStair({} as any)).rejects.toThrow(ApiError)
    })
  })

  describe('getCatalog', () => {
    it('should return catalog on success', async () => {
      const mockCatalog = {
        stairTypes: [{ id: '1', slug: 'straight', name: 'Прямая', workPricePerStep: 2000, minHeight: 2000, maxHeight: 4000, isActive: true }],
        materials: [],
        railings: [],
        coatings: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCatalog),
      })

      const result = await getCatalog()
      expect(result).toEqual(mockCatalog)
    })
  })

  describe('createOrder', () => {
    it('should return order response on success', async () => {
      const mockOrder = { orderId: '123', orderNumber: 'ORD-001', status: 'pending' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOrder),
      })

      const orderData = { customerName: 'Test', customerPhone: '+1234567890', stairConfig: {} }
      const result = await createOrder(orderData)

      expect(result).toEqual(mockOrder)
    })
  })

  describe('submitContact', () => {
    it('should return contact response on success', async () => {
      const mockContact = { status: 'ok', id: '456' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContact),
      })

      const contactData = { name: 'Test', phone: '+1234567890' }
      const result = await submitContact(contactData)

      expect(result).toEqual(mockContact)
    })
  })

  describe('ApiError', () => {
    it('should have correct properties', () => {
      const error = new ApiError(404, 'Not found')
      expect(error.status).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })
  })
})