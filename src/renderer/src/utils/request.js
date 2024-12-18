import axios from 'axios'
import _ from 'lodash'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@renderer/store'
const userStore = useUserStore()
import { stringify } from './index'

axios.defaults.timeout = 180000

function request(options) {
  // console.log('request ~ options:', options)
  // console.log('location.href', location.href)
  let { data, url, method = 'get' } = options

  let hostName =
    import.meta.env.MODE === 'production'
      ? 'http://8.138.20.29:3000/'
      : 'http://8.138.20.29:3000/'

  if (url.indexOf('http') == -1) {
    url =
      location.href.indexOf('admin') != -1
        ? hostName + 'admin/' + url
        : hostName + url
  }

  options.url =
    method.toLocaleLowerCase() === 'get'
      ? `${url}${_.isEmpty(data) ? '' : url.indexOf('?') == -1 ? '?' : '&'}${stringify(data)}`
      : url

  options.headers = {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: -1,
    token: userStore.token,
    ...options.headers
  }

  return axios(options)
}

// 响应拦截
axios.interceptors.response.use(
  (response) => {
    // console.log('request ~ response:', response)
    // const { data, config: requestConfig } = response
    return response.data
  },

  async (error) => {
    console.log('request ~ error:', error)

    const { response } = error
    let msg
    let statusCode
    if (response && response instanceof Object) {
      const { data = {}, statusText, status } = response
      statusCode = data.status || status
      msg = data.message || statusText
    }
    if (statusCode == 401) {
      ElMessage.error(msg)
      location.href = '#/login'
    }
    return Promise.reject({
      code: 500,
      message: msg || '接口故障',
      data: null
    })
  }
)

export default request
