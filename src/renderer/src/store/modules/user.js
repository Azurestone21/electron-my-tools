export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(0)
    const setToken = (value) => {
      token.value = value
    }

    return {
      token,
      setToken
    }
  },
  {
    persist: true // 持久化
  }
)
