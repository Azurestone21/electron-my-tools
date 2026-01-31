import { ref, onMounted, onUnmounted } from 'vue'

// 全局跟踪：事件源 -> 事件类型 -> { 回调函数, 选项, 计数 }
type ListenerInfo = {
  callback: Function
  options: AddEventListenerOptions | boolean
  count: number
}

const listenerMap = new WeakMap<EventTarget, Map<string, ListenerInfo>>()

/**
 * 通用事件监听器钩子
 * @param event 事件类型（如 'keydown'、'click'）
 * @param target 事件源（可以传入元素 id 或元素对象）
 * @param callback 事件回调函数
 * @param options 事件监听选项
 */
export function useEventListener(
  event: string,
  callback: Function,
  target: EventTarget | string | Document,
  options: AddEventListenerOptions | boolean = false
) {
  const isActive = ref(false)
  const currentTarget = ref()

  const getTarget = () => {
    if (target) {
      if (typeof target === 'object') {
        currentTarget.value = target
      } else if (typeof target === 'string') {
        currentTarget.value = document.getElementById(target)
      }
    }
  }

  // 注册监听器
  const registerListener = () => {
    // 检查target是否为有效的对象类型（WeakMap的键必须是对象）
    if (!currentTarget.value || typeof currentTarget.value !== 'object') {
      console.warn('useEventListener: Invalid target provided:', currentTarget.value)
      return
    }

    if (!listenerMap.has(currentTarget.value)) {
      listenerMap.set(currentTarget.value, new Map())
    }

    const eventMap = listenerMap.get(currentTarget.value)!
    const existingInfo = eventMap.get(event)

    if (existingInfo) {
      // 已存在监听器，增加计数
      existingInfo.count++
    } else {
      // 不存在监听器，创建新的
      eventMap.set(event, {
        callback,
        options,
        count: 1
      })
      currentTarget.value.addEventListener(event, callback as EventListener, options)
    }

    isActive.value = true
  }

  // 移除监听器
  const unregisterListener = () => {
    // 检查target是否为有效的对象类型
    if (!currentTarget.value || typeof currentTarget.value !== 'object') {
      return
    }

    const eventMap = listenerMap.get(currentTarget.value)
    if (!eventMap) return

    const existingInfo = eventMap.get(event)
    if (!existingInfo) return

    existingInfo.count--
    if (existingInfo.count <= 0) {
      // 计数为 0，移除监听器
      currentTarget.value.removeEventListener(
        event,
        existingInfo.callback as EventListener,
        existingInfo.options
      )
      eventMap.delete(event)

      // 若事件源无其他监听器，清理映射
      if (eventMap.size === 0) {
        listenerMap.delete(currentTarget.value)
      }
    }

    isActive.value = false
  }

  // 生命周期管理
  onMounted(() => {
    getTarget()
    registerListener()
  })
  onUnmounted(unregisterListener)

  return { isActive }
}
