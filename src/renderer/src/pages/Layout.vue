<!-- 框架 -->
<script setup lang="ts">
import menuList from '@renderer/router/menu'
import { Setting } from '@element-plus/icons-vue'
import AppSettings from '../components/AppSettings.vue'
const router = useRouter()
const route = useRoute()
const indexStore = useIndexStore()
const { appSettings } = storeToRefs(indexStore)

const fullScreen = () => {
  window.myHandle.handleScreen('full')
}
const minScreen = () => {
  window.myHandle.handleScreen('min')
}
const closeScreen = () => {
  window.myHandle.handleScreen('close')
}
const clickMenuItem = (path) => {
  indexStore.clearPage()
  router.push(path)
}

// 打开设置弹窗
const openAppSettings = () => {
  indexStore.setStore({
    appSettingsVisible: true
  })
}

onMounted(() => {
  indexStore.clearPage()
})

const showPageHeader = ref<boolean>(false)
const breadcrumb = ref<Array<{ path: string; name: string }>>([])
watchEffect(() => {
  if (indexStore.pageStack.length > 1) {
    showPageHeader.value = true
    breadcrumb.value = indexStore.pageStack
  } else {
    showPageHeader.value = false
    breadcrumb.value = []
  }
})

// 计算当前主题
const currentTheme = computed(() => {
  return appSettings.value?.theme || 'light'
})
</script>

<template>
  <div class="layout-container" :class="`theme-${currentTheme}`">
    <div class="content">
      <!-- 侧边栏 -->
      <aside class="aside">
        <div class="aside-header">
          <div class="avatar"></div>
        </div>
        <div class="menu-bar">
          <div
            class="menu-item"
            v-for="(item, index) in menuList"
            :key="index"
            :class="{ active: route.path === item.path }"
            @click="clickMenuItem(item.path)"
          >
            <el-icon size="20">
              <component :is="item.icon"></component>
            </el-icon>
          </div>
        </div>
        <div class="aside-footer">
          <div class="setting-btn" @click="openAppSettings">
            <el-icon class="icon" size="20"><Setting /></el-icon>
          </div>
        </div>
      </aside>
      <div class="containers">
        <!-- 工具条 -->
        <div class="tool-bar drag">
          <div class="minWindow no_drag">
            <el-icon class="icon" @click="minScreen"><Minus /></el-icon>
          </div>
          <div class="maxWindow no_drag">
            <el-icon class="icon" @click="fullScreen"><FullScreen /></el-icon>
          </div>
          <div class="closeWindow no_drag">
            <el-icon class="icon" @click="closeScreen"><Close /></el-icon>
          </div>
        </div>
        <div class="main">
          <!-- 面包屑 -->
          <template v-if="showPageHeader">
            <el-breadcrumb separator="/" style="padding: 0 20px">
              <template v-for="item in breadcrumb" key="index">
                <el-breadcrumb-item :to="{ path: item.path }">
                  {{ item.name }}
                </el-breadcrumb-item>
              </template>
            </el-breadcrumb>
          </template>
          <!-- 页面 -->
          <div
            class="router-view"
            :style="{ height: `calc(100% - ${showPageHeader ? '14px' : '0px'})` }"
          >
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>

    <app-settings />
  </div>
</template>

<style lang="less" scoped>
.layout-container {
  height: 100vh;

  .content {
    height: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .aside {
    flex-shrink: 0;
    position: relative;
    border-right: 1px solid var(--border);
    width: 64px;
    height: 100%;
    background-color: var(--background);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .aside-header {
      width: 100%;
      height: 90px;
      display: flex;
      justify-content: center;
      align-items: center;

      .avatar {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background-color: #e4e7ed;

        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .menu-bar {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;

      display: flex;
      flex-direction: column;
      justify-content: center;

      .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 64px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #666;

        &:hover {
          color: var(--primary);
          background-color: var(--accent);
        }

        &.active {
          color: var(--primary);
        }
      }
    }

    .aside-footer {
      width: 100%;
      min-height: 64px;

      display: flex;
      align-items: center;
      justify-content: center;

      .setting-btn {
        width: 100%;
        height: 64px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #666;

        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
          color: var(--foreground);
        }

        &:hover {
          color: var(--primary);
        }
      }
    }
  }

  .containers {
    flex: 1;
    height: 100%;
    background-color: var(--background);

    .tool-bar {
      display: flex;
      justify-content: flex-end;
      padding: 10px 20px;

      div {
        width: 30px;
        display: flex;
        justify-content: flex-end;
      }

      .icon {
        color: var(--foreground);
      }
    }
    .main {
      position: relative;
      height: calc(100% - 36px);
      overflow-y: auto;
    }
  }

  .router-view {
  }
}
</style>
