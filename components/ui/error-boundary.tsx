'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="bg-cpn-card border border-red-500/30 rounded-lg p-6 text-center">
      <h2 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h2>
      <p className="text-cpn-gray mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="bg-cpn-yellow text-cpn-dark px-4 py-2 rounded-lg font-medium hover:bg-cpn-yellow/90 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}