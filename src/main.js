import { createApp } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomePage from './components/HomePage.vue'
import EditDiaryPage from './components/EditDiaryPage.vue'
import DiaryDetailPage from './components/DiaryDetailPage.vue'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences';

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/edit/:id?',
      name: 'edit',
      component: EditDiaryPage
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DiaryDetailPage
    }
  ]
})

// 创建Vuex store实例
const store = createStore({
  state() {
    return {
      diaries: []
    }
  },
  mutations: {
    setDiaries(state, diaries) {
      state.diaries = diaries
    },
    addDiary(state, diary) {
      state.diaries.unshift(diary)
    },
    updateDiary(state, updatedDiary) {
      const index = state.diaries.findIndex(d => d.id === updatedDiary.id)
      if (index !== -1) {
        state.diaries[index] = updatedDiary
      }
    },
    deleteDiary(state, id) {
      state.diaries = state.diaries.filter(d => d.id !== id)
    }
  },
  actions: {
    async loadDiaries({ commit }) {
        try {
          const result = await Preferences.get({ key: 'diaries' })
          let diaries = result.value ? JSON.parse(result.value) : []
          
          // 如果没有日记，创建一些示例日记
          if (diaries.length === 0) {
            const mockDiaries = [
              {
                id: Date.now().toString() + '1',
                title: '第一次使用日记应用',
                content: '今天是我第一次使用这款日记应用。感觉界面很简洁，操作也很方便。\n\n希望这款应用能帮助我记录生活中的美好瞬间和重要思考。',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
                weather: '☀️ 晴朗',
                mood: '😊 开心'
              },
              {
                id: Date.now().toString() + '2',
                title: '开发日记应用的想法',
                content: '这款日记应用基于Vue.js开发，可以运行在Android设备上。使用了Capacitor框架来实现跨平台功能。\n\n主要功能包括：\n- 创建、编辑和删除日记\n- 查看日记列表和详情\n- 本地存储日记数据\n- 响应式设计，适配各种移动设备',
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 前天
                updatedAt: new Date(Date.now() - 172800000).toISOString(),
                weather: '☁️ 多云',
                mood: '😃 兴奋'
              }
            ]
            
            diaries = mockDiaries
            // 保存示例日记到存储
            await Preferences.set({
              key: 'diaries',
              value: JSON.stringify(diaries)
            })
          }
          
          commit('setDiaries', diaries)
        } catch (error) {
          console.error('加载日记失败:', error)
          commit('setDiaries', [])
        }
      },
    async saveDiary({ commit, state }, diary) {
      try {
        
        if (diary.id) {
          // 更新现有日记
          commit('updateDiary', diary)
        } else {
          // 添加新日记
          const newDiary = {
            ...diary,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          }
          commit('addDiary', newDiary)
          diary = newDiary
        }
        
        // 保存到存储
        await Preferences.set({
          key: 'diaries',
          value: JSON.stringify(state.diaries)
        })
        
        return diary
      } catch (error) {
        console.error('保存日记失败:', error)
        throw error
      }
    },
    async deleteDiary({ commit, state }, id) {
      try {
        commit('deleteDiary', id)
        
        // 保存到存储
        await Preferences.set({
          key: 'diaries',
          value: JSON.stringify(state.diaries)
        })
      } catch (error) {
        console.error('删除日记失败:', error)
        throw error
      }
    }
  },
  getters: {
    sortedDiaries: (state) => {
      return [...state.diaries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
    getDiaryById: (state) => (id) => {
      return state.diaries.find(d => d.id === id)
    }
  }
})

// 创建并挂载应用实例
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')

// 应用启动时加载日记数据
store.dispatch('loadDiaries')