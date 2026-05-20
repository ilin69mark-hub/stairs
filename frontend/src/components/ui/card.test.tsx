import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card', () => {
  it('should render Card component', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<Card size="default">Default size</Card>)
    expect(screen.getByText('Default size')).toBeInTheDocument()

    rerender(<Card size="sm">Small size</Card>)
    expect(screen.getByText('Small size')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<Card className="custom-card">Content</Card>)
    const card = screen.getByText('Content')
    expect(card.classList.contains('custom-card')).toBe(true)
  })
})

describe('CardHeader', () => {
  it('should render CardHeader', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)
    const header = screen.getByText('Header')
    expect(header.classList.contains('custom-header')).toBe(true)
  })
})

describe('CardTitle', () => {
  it('should render CardTitle', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title.classList.contains('custom-title')).toBe(true)
  })
})

describe('CardDescription', () => {
  it('should render CardDescription', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('should render CardContent', () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)
    const content = screen.getByText('Content')
    expect(content.classList.contains('custom-content')).toBe(true)
  })
})

describe('CardFooter', () => {
  it('should render CardFooter', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer.classList.contains('custom-footer')).toBe(true)
  })
})