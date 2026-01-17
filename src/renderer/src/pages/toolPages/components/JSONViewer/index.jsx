import { defineComponent, ref } from 'vue'
import './index.less'

// 检查值的类型
const getValueType = (value) => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

// JSON查看器组件
export default defineComponent({
  name: 'JSONViewer',
  props: {
    json: {
      type: [Object, Array],
      required: true
    },
    error: {
      type: String,
      default: ''
    },
    level: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    console.log(props)
    // 展开状态管理
    const expanded = ref(new Map())
    console.log('expanded.value:', expanded.value)

    // 切换展开/收起状态
    const toggleExpand = (path) => {
      console.log('toggleExpand:', path)
      expanded.value.set(path, !expanded.value.get(path))
    }

    // 检查是否展开
    const isExpanded = (path) => {
      return expanded.value.get(path) !== false
    }

    // 渲染值
    const renderValue = (value, path, key) => {
      const type = getValueType(value)
      const valuePath = path ? `${path}.${key}` : key

      // 渲染对象
      if (type === 'object') {
        const keys = Object.keys(value)
        const isEmpty = keys.length === 0

        return (
          <div class="json-item">
            <div class="json-toggle">
              {!isEmpty && (
                <span
                  class={`toggle-btn ${isExpanded(valuePath) ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(valuePath)}
                >
                  {isExpanded(valuePath) ? '▼' : '▶'}
                </span>
              )}
              <span class="json-key">{key}:</span>
              <span class="json-bracket">
                {isEmpty ? '{}' : !isExpanded(valuePath) ? '{...}' : '{'}
              </span>
            </div>

            {!isEmpty && isExpanded(valuePath) && (
              <div class="json-children" style={{ marginLeft: '20px' }}>
                {keys.map((childKey) => renderValue(value[childKey], valuePath, childKey))}
                <div class="json-bracket json-end" style={{ marginLeft: `${props.level * 20}px` }}>
                  {'}'}
                </div>
              </div>
            )}
          </div>
        )
      }

      // 渲染数组
      if (type === 'array') {
        const isEmpty = value.length === 0

        return (
          <div class="json-item">
            <div class="json-toggle">
              {!isEmpty && (
                <span
                  class={`toggle-btn ${isExpanded(valuePath) ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(valuePath)}
                >
                  {isExpanded(valuePath) ? '▼' : '▶'}
                </span>
              )}
              <span class="json-key">{key}:</span>
              <span class="json-bracket">
                {isEmpty ? '[]' : !isExpanded(valuePath) ? '[...]' : '['}
              </span>
            </div>

            {!isEmpty && isExpanded(valuePath) && (
              <div class="json-children" style={{ marginLeft: '20px' }}>
                {value.map((item, index) => renderValue(item, valuePath, `[${index}]`))}
                <div class="json-bracket json-end" style={{ marginLeft: `${props.level * 20}px` }}>
                  {']'}
                </div>
              </div>
            )}
          </div>
        )
      }

      // 渲染其他类型
      const valueClass = {
        string: 'json-string',
        number: 'json-number',
        boolean: 'json-boolean',
        null: 'json-null'
      }[type]

      const displayValue = type === 'string' ? `"${value}"` : String(value)

      return (
        <div class="json-item">
          <div class="json-toggle">
            <span class="toggle-btn placeholder"></span>
            <span class="json-key">{key}:</span>
            <span class={valueClass}>{displayValue}</span>
          </div>
        </div>
      )
    }

    // 渲染根元素
    const renderRoot = () => {
      const type = getValueType(props.json)

      if (type === 'object') {
        const keys = Object.keys(props.json)

        return (
          <div class="json-container">
            <div class="json-toggle">
              <span class="json-bracket">{'{'}</span>
            </div>
            <div class="json-children">
              {keys.map((key) => renderValue(props.json[key], '', key))}
              <div class="json-bracket json-end">{'}'}</div>
            </div>
          </div>
        )
      }

      if (type === 'array') {
        return (
          <div class="json-container">
            <div class="json-toggle">
              <span class="json-bracket">{'['}</span>
            </div>
            <div class="json-children" style={{ marginLeft: '20px' }}>
              {props.json.map((item, index) => renderValue(item, '', `[${index}]`))}
              <div class="json-bracket json-end">{']'}</div>
            </div>
          </div>
        )
      }

      return (
        <div class="json-container">
          <div class="json-toggle">
            <span>{String(props.json)}</span>
          </div>
        </div>
      )
    }

    return () => {
      if (props.error) {
        return <div class="json-error">{props.error}</div>
      }

      return <div class="json-viewer">{renderRoot()}</div>
    }
  }
})
