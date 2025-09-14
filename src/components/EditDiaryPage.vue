<template>
  <div class="edit-page">
    <header>
      <h1>{{ isEditing ? '编辑日记' : '写日记' }}</h1>
      <button class="btn btn-secondary" @click="goBack">返回</button>
    </header>
    
    <main>
      <div class="edit-form card">
        <input 
          type="text" 
          v-model="form.title" 
          placeholder="标题"
          class="title-input"
        >
        
        <!-- 天气选择 -->
        <div class="weather-mood-container">
          <div class="weather-selector">
            <label>天气：</label>
            <select v-model="form.weather" class="weather-select">
              <option value="">请选择天气</option>
              <option v-for="weather in weatherOptions" :key="weather" :value="weather">
                {{ weather }}
              </option>
            </select>
          </div>
          
          <!-- 心情选择 -->
          <div class="mood-selector">
            <label>心情：</label>
            <select v-model="form.mood" class="mood-select">
              <option value="">请选择心情</option>
              <option v-for="mood in moodOptions" :key="mood" :value="mood">
                {{ mood }}
              </option>
            </select>
          </div>
        </div>
        
        <textarea 
          v-model="form.content" 
          placeholder="今天有什么想说的？"
          class="content-input"
        ></textarea>
        
        <!-- 图片上传区域 -->
        <div class="image-upload-container">
          <h3>添加图片</h3>
          <div class="image-upload-area">
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*" 
              multiple 
              @change="handleImageUpload"
              class="image-upload-input"
            >
            <label for="image-upload" class="image-upload-label">
              <div class="upload-icon">+</div>
              <div class="upload-text">点击上传图片</div>
            </label>
          </div>
          
          <!-- 图片预览区域 -->
          <div v-if="form.images.length > 0" class="image-preview-container">
            <div v-for="(image, index) in form.images" :key="index" class="image-preview-item">
              <img :src="image" alt="预览图片" class="image-preview">
              <button @click="removeImage(index)" class="image-remove-btn">×</button>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            v-if="isEditing" 
            class="btn btn-danger" 
            @click="deleteDiary"
          >
            删除
          </button>
          <div class="right-actions">
            <button class="btn btn-secondary" @click="resetForm">清空</button>
            <button class="btn btn-primary" @click="saveDiary">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'EditDiaryPage',
  data() {
    return {
      form: {
        title: '',
        content: '',
        weather: '',
        mood: '',
        images: []
      },
      isEditing: false,
      currentDiaryId: null,
      weatherOptions: ['☀️ 晴朗', '☁️ 多云', '🌧️ 下雨', '🌨️ 下雪', '⛅ 阴天', '🌩️ 雷暴'],
      moodOptions: ['😊 开心', '😔 难过', '😐 平静', '😃 兴奋', '😴 疲惫', '😠 生气', '🥰 幸福']
    }
  },
  mounted() {
    const id = this.$route.params.id
    if (id) {
      this.isEditing = true
      this.currentDiaryId = id
      this.loadDiaryData(id)
    } else {
      // 新增日记时，自动设置当前日期为标题（可选）
      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      const day = today.getDate().toString().padStart(2, '0')
      this.form.title = `${year}-${month}-${day}`
    }
  },
  methods: {
    loadDiaryData(id) {
      const diary = this.$store.getters.getDiaryById(id)
      if (diary) {
        this.form = {
          ...diary,
          images: diary.images || []
        }
      }
    },
    
    // 处理图片上传
    handleImageUpload(e) {
      const files = e.target.files
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          // 限制文件大小，例如5MB
          if (file.size > 5 * 1024 * 1024) {
            alert('文件过大，请选择小于5MB的图片')
            continue
          }
          
          const reader = new FileReader()
          reader.onload = (event) => {
            this.form.images.push(event.target.result)
          }
          reader.readAsDataURL(file)
        }
      }
      // 清空input值，允许重复选择同一个文件
      e.target.value = ''
    },
    
    // 移除图片
    removeImage(index) {
      this.form.images.splice(index, 1)
    },
    async saveDiary() {
      if (!this.form.content.trim()) {
        alert('日记内容不能为空')
        return
      }
      
      try {
        const diaryData = {
          ...this.form,
          updatedAt: new Date().toISOString()
        }
        
        if (this.isEditing) {
          diaryData.id = this.currentDiaryId
        } else {
          // 新增日记时，如果没有标题，使用当前日期作为标题
          if (!diaryData.title.trim()) {
            const today = new Date()
            const year = today.getFullYear()
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const day = today.getDate().toString().padStart(2, '0')
            diaryData.title = `${year}-${month}-${day}`
          }
        }
        
        await this.$store.dispatch('saveDiary', diaryData)
        this.$router.push('/')
      } catch (error) {
        alert('保存失败，请重试')
        console.error('保存日记失败:', error)
      }
    },
    async deleteDiary() {
      if (confirm('确定要删除这篇日记吗？')) {
        try {
          await this.$store.dispatch('deleteDiary', this.currentDiaryId)
          this.$router.push('/')
        } catch (error) {
          alert('删除失败，请重试')
          console.error('删除日记失败:', error)
        }
      }
    },
    resetForm() {
      this.form = {
        title: '',
        content: '',
        weather: '',
        mood: '',
        images: []
      }
    },
    goBack() {
      if (this.form.title || this.form.content) {
        if (confirm('确定要放弃编辑吗？')) {
          this.$router.push('/')
        }
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.edit-page {
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
  font-size: 24px;
  color: #333;
}

.edit-form {
  position: relative;
}

.title-input {
  font-size: 24px;
  font-weight: bold;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  width: 100%;
}

.weather-mood-container {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.weather-selector, .mood-selector {
  flex: 1;
}

.weather-selector label, .mood-selector label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.weather-select, .mood-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
}

.content-input {
  font-size: 16px;
  line-height: 1.8;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-height: 400px;
  resize: vertical;
  width: 100%;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.right-actions {
  display: flex;
  gap: 10px;
}

/* 适配移动设备的样式 */
@media (max-width: 600px) {
  .edit-page {
    padding: 12px;
  }
  
  .weather-mood-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .right-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 图片上传相关样式 */
.image-upload-container {
  margin-top: 20px;
}

.image-upload-container h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.image-upload-area {
  position: relative;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.image-upload-area:hover {
  border-color: #007bff;
}

.image-upload-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.image-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-icon {
  font-size: 32px;
  color: #999;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #666;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.image-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-remove-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>