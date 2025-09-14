<template>
  <div class="detail-page">
    <header>
      <h1>{{ diary?.title || '无标题' }}</h1>
      <div class="header-actions">
        <router-link :to="'/edit/' + diary?.id" class="btn btn-secondary">编辑</router-link>
        <button class="btn btn-primary" @click="goBack">返回</button>
      </div>
    </header>
    
    <main v-if="diary">
      <div class="detail-card card">
        <div class="diary-meta">
          <span class="diary-date">{{ formatDate(diary.createdAt) }}</span>
          <span v-if="diary.updatedAt && diary.updatedAt !== diary.createdAt" class="diary-updated">
            （编辑于 {{ formatDate(diary.updatedAt) }}）
          </span>
          <div v-if="diary.weather || diary.mood" class="diary-meta-info">
            <span v-if="diary.weather" class="diary-weather">{{ diary.weather }}</span>
            <span v-if="diary.weather && diary.mood" class="separator">·</span>
            <span v-if="diary.mood" class="diary-mood">{{ diary.mood }}</span>
          </div>
        </div>
        
        <!-- 图片展示区域 -->
        <div v-if="diary.images && diary.images.length > 0" class="detail-images-container">
          <div class="detail-images-grid">
            <img 
              v-for="(image, index) in diary.images" 
              :key="index" 
              :src="image" 
              alt="日记图片" 
              class="detail-image"
              @click="previewImage(image, index)"
            >
          </div>
        </div>
        
        <div class="diary-content" v-html="formatContent(diary.content)"></div>
      </div>
    </main>
    
    <div v-else class="loading">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiaryDetailPage',
  data() {
    return {
      diary: null
    }
  },
  mounted() {
    this.loadDiary()
  },
  watch: {
    '$route': 'loadDiary'
  },
  methods: {
    loadDiary() {
      const id = this.$route.params.id
      const diary = this.$store.getters.getDiaryById(id)
      if (diary) {
        this.diary = diary
      } else {
        // 如果找不到日记，返回首页
        this.$router.push('/')
      }
    },
    
    // 预览图片
    previewImage(image, index) {
      // 在实际应用中，这里可以实现全屏图片预览功能
      // 简单的实现：使用原生alert显示图片
      alert('点击了第' + (index + 1) + '张图片')
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    formatContent(content) {
      // 将换行符转换为<br>标签
      return content.replace(/\n/g, '<br>')
    },
    goBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.detail-page {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 10px;
}

header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.diary-meta {
  margin-bottom: 20px;
  color: #999;
  font-size: 14px;
}

.diary-meta-info {
  display: flex;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
  color: #888;
}

.diary-weather, .diary-mood {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 15px;
  background-color: #f5f5f5;
}

.separator {
  margin: 0 8px;
  color: #ccc;
}

.diary-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 图片展示相关样式 */
.detail-images-container {
  margin: 20px 0;
}

.detail-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.detail-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.detail-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 适配移动设备的样式 */
@media (max-width: 600px) {
  .detail-page {
    padding: 12px;
  }
  
  header {
    flex-direction: column;
    align-items: stretch;
  }
  
  header h1 {
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .detail-images-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-image {
    height: 250px;
  }
}
</style>