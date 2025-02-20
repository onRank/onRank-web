import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// MSW 활성화 여부 확인
if (import.meta.env.VITE_MSW_ENABLED === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass' // 처리되지 않은 요청은 그대로 통과
  })
} 