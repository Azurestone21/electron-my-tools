// 定义列类型
export interface Column {
  key: string
  label: string
  align?: 'center' | 'left' | 'right'
  render?: (row: any) => any
}

// 定义操作按钮类型
export interface ActionButton {
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  hide?: (row: any) => boolean
  handler: (row: any) => void | Promise<void>
}
