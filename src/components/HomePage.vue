<template>
  <div class="homepage">
    <header>
      <h1>我的日记</h1>
      <router-link :to="'/edit'" class="btn btn-primary">写日记</router-link>
    </header>
    
    <main>
      <div v-if="sortedDiaries.length === 0" class="empty-state">
        <p>还没有写日记哦~</p>
        <p>点击上方按钮开始记录你的第一天吧！</p>
      </div>
      
      <div v-else class="diary-list">
        <div 
          v-for="diary in sortedDiaries" 
          :key="diary.id" 
          class="diary-item card"
          @click="viewDetail(diary.id)"
        >
          <div class="diary-header">
            <h3 class="diary-title">{{ diary.title || '无标题' }}</h3>
            <span class="diary-date">{{ formatDate(diary.createdAt) }}</span>
          </div>
          <div v-if="diary.weather || diary.mood" class="diary-meta-info">
            <span v-if="diary.weather" class="diary-weather">{{ diary.weather }}</span>
            <span v-if="diary.weather && diary.mood" class="separator">·</span>
            <span v-if="diary.mood" class="diary-mood">{{ diary.mood }}</span>
          </div>
          <p class="diary-content">{{ truncateText(diary.content, 100) }}</p>
          
          <!-- 图片预览区域 -->
          <div v-if="diary.images && diary.images.length > 0" class="diary-images-preview">
            <div class="images-grid">
              <img 
                v-for="(image, index) in diary.images.slice(0, 3)" 
                :key="index" 
                :src="image" 
                alt="日记图片" 
                class="diary-image-preview"
              >
              <div v-if="diary.images.length > 3" class="more-images-indicator">
                +{{ diary.images.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  computed: {
    sortedDiaries() {
      return this.$store.getters.sortedDiaries
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    viewDetail(id) {
      this.$router.push({ name: 'detail', params: { id } })
    }
  },
  mounted() {
    // 组件挂载时重新加载日记数据
    this.$store.dispatch('loadDiaries')
  }
}
</script>

<style scoped>
.homepage {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-item {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.diary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.diary-title {
  margin: 0;
  font-size: 20px;
  color: #333;
  flex: 1;
  margin-right: 10px;
}

.diary-date {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
}

.diary-meta-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #888;
}

.diary-weather, .diary-mood {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #f5f5f5;
}

.separator {
  margin: 0 8px;
  color: #ccc;
}

/* 日记图片预览样式 */
.diary-images-preview {
  margin-top: 12px;
}

.images-grid {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.diary-image-preview {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

.more-images-indicator {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.diary-content {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>