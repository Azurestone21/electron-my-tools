<!-- 框架 -->
<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import menuList from '@renderer/router/menu'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useIndexStore } from '@renderer/store'
const indexStore = useIndexStore()


const fullScreen = () => {
  myHandle.handleScreen('full')
}
const minScreen = () => {
  myHandle.handleScreen('min')
}
const closeScreen = () => {
  myHandle.handleScreen('close')
}
const clickMenuItem = () => {
  indexStore.clearPage()
}

const isCollapse = ref(true)
const showPageHeader = ref(false)
const breadcrumb = ref([])

onMounted(() => {})
watchEffect(() => {
  if (indexStore.pageStack.length > 1) {
    showPageHeader.value = true
    breadcrumb.value = indexStore.pageStack
  } else {
    showPageHeader.value = false
    breadcrumb.value = []
  }
})

</script>

<template>
  <el-container class="layout-container">
    <el-container class="content">
      <el-aside class="aside" :class="{ asideCollapse: isCollapse }">
        <div class="avatar">
          <el-avatar :icon="UserFilled" />
        </div>
        <el-scrollbar class="scrollbar">
          <el-menu
            :default-active="$route.path"
            active-text-color="#409EFF"
            background-color="#eaf1fc"
            text-color="#333333"
            router
            :collapse="isCollapse"
          >
            <el-menu-item
              v-for="(item, index) in menuList"
              :key="index"
              :index="item.path"
              @click="clickMenuItem"
            >
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.pathName }}</span>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container class="container">
        <el-scrollbar class="scrollbar">
          <el-main class="main">
            <div class="handleWindow drag">
              <div class="minWindow no_drag">
                <el-icon @click="minScreen"><Minus /></el-icon>
              </div>
              <div class="maxWindow no_drag">
                <el-icon @click="fullScreen"><FullScreen /></el-icon>
              </div>
              <div class="closeWindow no_drag">
                <el-icon @click="closeScreen"><Close /></el-icon>
              </div>
            </div>
            <template v-if="showPageHeader">
              <el-breadcrumb separator="/">
                <template v-for="item in breadcrumb" key="index">
                  <el-breadcrumb-item :to="{ path: item.path }">
                    {{ item.name }}
                  </el-breadcrumb-item>
                </template>
              </el-breadcrumb>
            </template>
            <router-view></router-view>
          </el-main>
        </el-scrollbar>
      </el-container>
    </el-container>
  </el-container>
</template>

<style lang="less" scoped>
.layout-container {
  height: 100vh;

  .content {
  }

  .avatar {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .aside {
    position: relative;
    background-color: #eaf1fc;
    width: 180px;

    .scrollbar {
      height: auto;
    }

    &.asideCollapse {
      width: auto;
    }

    &__logo {
      height: 120px;
    }
    .el-menu {
      border-right: none;
    }
    .el-menu-item.is-active {
      font-weight: bold;
    }
  }

  .container {
    .scrollbar {
      width: 100%;
      height: 100%;
    }
    .main {
      position: relative;
      padding-top: 40px;

      .handleWindow {
        display: flex;
        justify-content: flex-end;
        position: fixed;
        top: 0;
        right: 0;
        padding: 10px 20px;
        width: calc(100% - 180px);
        background-color: #fff;

        div {
          width: 30px;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
