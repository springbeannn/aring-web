'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { err: Error | null };

export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: unknown) {
    // 진단용 — 운영 콘솔에 명시적 메시지를 남긴다
    console.error('[TrafficChart] render error:', err, info);
  }

  render() {
    if (this.state.err) {
      return (
        <section className="bg-white rounded-2xl shadow-card border border-aring-ink-100 p-6">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[13px] px-3 py-3 rounded-lg">
            <p className="font-bold mb-1">방문자 통계 컴포넌트에서 오류가 발생했습니다</p>
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-rose-800">
              {this.state.err.name}: {this.state.err.message}
              {this.state.err.stack ? '\n' + this.state.err.stack.split('\n').slice(0, 4).join('\n') : ''}
            </pre>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
