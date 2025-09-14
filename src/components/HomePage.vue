<template>
  <div class="homepage">
    <!-- 日历组件 -->
    <div class="calendar-container" :class="{ 'collapsed': isCalendarCollapsed }">
      <!-- 写日记按钮 - 移动到日历组件右上角 -->
      <router-link :to="'/edit'" class="calendar-diary-btn">写日记</router-link>

      
      <div class="calendar-header">
        <div class="calendar-nav">
          <button @click="navigate(-1)" class="calendar-nav-btn">‹</button>
          <h2>{{ isCalendarCollapsed ? currentWeekRange : currentMonthYear }}</h2>
          <button @click="navigate(1)" class="calendar-nav-btn">›</button>
        </div>
      </div>
      
      <!-- 日历网格 -->
      <div class="calendar-grid" v-show="!isCalendarCollapsed">
        <!-- 星期标题 -->
        <div class="calendar-weekdays">
          <div v-for="day in weekDays" :key="day" class="calendar-weekday">
            {{ day }}
          </div>
        </div>
        
        <!-- 日历日期 -->
        <div class="calendar-days">
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            :class="[
              'calendar-day',
              { 'other-month': day.isOtherMonth },
              { 'has-diary': day.hasDiary },
              { 'selected': selectedDate === day.date }
            ]"
            @click="!day.isOtherMonth && selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
      </div>
      
      <!-- 单周视图 -->
      <div class="calendar-week-view" v-show="isCalendarCollapsed">
        <!-- 星期标题 -->
        <div class="calendar-weekdays">
          <div v-for="day in weekDays" :key="day" class="calendar-weekday">
            {{ day }}
          </div>
        </div>
        
        <!-- 单周日期 -->
        <div class="calendar-week-days">
          <div 
            v-for="day in currentWeekDays" 
            :key="day.date"
            :class="[
              'calendar-day',
              { 'other-month': day.isOtherMonth },
              { 'has-diary': day.hasDiary },
              { 'selected': selectedDate === day.date },
              { 'today': isToday(day.date) }
            ]"
            @click="!day.isOtherMonth && selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
      </div>
      

    </div>
    
    <main>
      <div v-if="filteredDiaries.length === 0 && sortedDiaries.length > 0 && selectedDate" class="empty-state">
        <p>在 {{ selectedDate }} 这一天没有写日记哦~</p>
      </div>
      
      <div v-else-if="sortedDiaries.length === 0" class="empty-state">
        <p>还没有写日记哦~</p>
        <p>点击上方按钮开始记录你的第一天吧！</p>
      </div>
      
      <div v-else class="diary-list">
        <div 
          v-for="diary in filteredDiaries" 
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
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      isCalendarCollapsed: true, // 默认折叠日历，只显示一周
      scrollHandler: null,
      lastScrollTop: 0,
      dragStartY: 0, // 拖拽起始Y坐标
      touchStartY: 0 // 触摸起始Y坐标
    }
  },
  computed: {
    sortedDiaries() {
      return this.$store.getters.sortedDiaries
    },
    
    // 根据选中的日期过滤日记
    filteredDiaries() {
      if (!this.selectedDate) {
        return this.sortedDiaries
      }
      
      return this.sortedDiaries.filter(diary => {
        const diaryDate = this.formatDate(diary.createdAt)
        return diaryDate === this.selectedDate
      })
    },
    
    // 当前月份和年份的显示
    currentMonthYear() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      return `${year}年${month}月`
    },
    
    // 当前周的日期范围
    currentWeekRange() {
      const weekStart = new Date(this.currentDate)
      const day = weekStart.getDay() || 7; // 将周日(0)转换为7
      weekStart.setDate(weekStart.getDate() - day + 1); // 获取本周一
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6); // 获取本周日
      
      const formatWeekDate = (date) => {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日`
      }
      
      return `${formatWeekDate(weekStart)} - ${formatWeekDate(weekEnd)}`
    },
    
    // 当前周的日期数据
    currentWeekDays() {
      const weekDays = []
      const weekStart = new Date(this.currentDate)
      const day = weekStart.getDay() || 7; // 将周日(0)转换为7
      weekStart.setDate(weekStart.getDate() - day + 1); // 获取本周一
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        
        // 检查是否是当前月份
        const isOtherMonth = date.getMonth() !== this.currentDate.getMonth()
        
        weekDays.push({
          day,
          date: dateStr,
          isOtherMonth,
          hasDiary: this.hasDiaryOnDate(dateStr)
        })
      }
      
      return weekDays
    },
    
    // 日历日期数据
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      // 获取当月第一天
      const firstDay = new Date(year, month, 1)
      // 获取当月最后一天
      const lastDay = new Date(year, month + 1, 0)
      
      // 获取当月第一天是星期几
      const firstDayOfWeek = firstDay.getDay()
      // 获取当月的天数
      const daysInMonth = lastDay.getDate()
      
      // 获取上个月的最后几天
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      
      const days = []
      
      // 添加上个月的最后几天
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        days.push({
          day,
          date,
          isOtherMonth: true,
          hasDiary: this.hasDiaryOnDate(date)
        })
      }
      
      // 添加当月的天数
      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        days.push({
          day: i,
          date,
          isOtherMonth: false,
          hasDiary: this.hasDiaryOnDate(date)
        })
      }
      
      // 计算需要添加的下个月的天数，使总天数达到42（6周）
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const date = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        days.push({
          day: i,
          date,
          isOtherMonth: true,
          hasDiary: this.hasDiaryOnDate(date)
        })
      }
      
      return days
    }
  },
  methods: {
    // 处理鼠标滚轮事件
    handleWheel(event) {
      console.log('Wheel event triggered:', event.deltaY)
      
      // 向下滚动（deltaY为正）
      if (event.deltaY > 50) {
        console.log('Wheel down - collapse calendar')
        this.isCalendarCollapsed = true
      }
      // 向上滚动（deltaY为负）
      else if (event.deltaY < -50) {
        console.log('Wheel up - expand calendar')
        this.isCalendarCollapsed = false
      }
    },
    
    // 处理触摸事件（移动设备）
    handleTouch(event) {
      if (event.type === 'touchstart') {
        this.touchStartY = event.touches[0].clientY
        console.log('Touch start at:', this.touchStartY)
      } else if (event.type === 'touchmove') {
        const touchY = event.touches[0].clientY
        const diff = touchY - this.touchStartY
        
        console.log('Touch move:', touchY, 'Diff:', diff)
        
        // 向上滑动（手指向下移动，diff为正）
        if (diff > 50) {
          console.log('Touch up - expand calendar')
          this.isCalendarCollapsed = false
          this.touchStartY = touchY // 重置起点
        }
        // 向下滑动（手指向上移动，diff为负）
        else if (diff < -50) {
          console.log('Touch down - collapse calendar')
          this.isCalendarCollapsed = true
          this.touchStartY = touchY // 重置起点
        }
      }
    },
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
    },
    
    // 检查指定日期是否有日记
    hasDiaryOnDate(date) {
      return this.sortedDiaries.some(diary => {
        return this.formatDate(diary.createdAt) === date
      })
    },
    
    // 选择日期进行筛选，如果点击已选中的日期则清除筛选
    selectDate(date) {
      if (this.selectedDate === date) {
        this.selectedDate = null
      } else {
        this.selectedDate = date
      }
    },
    
    // 导航方法 - 简化为单一方法，避免复杂的条件判断
    navigate(direction) {
      if (this.isCalendarCollapsed) {
        // 折叠状态下导航周
        const newDate = new Date(this.currentDate)
        newDate.setDate(newDate.getDate() + (direction * 7))
        this.currentDate = newDate
      } else {
        // 展开状态下导航月
        this.currentDate = new Date(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth() + direction,
          1
        )
      }
    },
    
    // 检查是否是今天
    isToday(dateStr) {
      const today = this.formatDate(new Date())
      return dateStr === today
    },
    

    
    // 拖拽开始
    startDrag(event) {
      console.log('Drag started')
      this.dragStartY = event.clientY || event.touches[0].clientY
      
      // 添加拖拽事件监听
      const mouseMoveHandler = (e) => this.onDrag(e)
      const mouseUpHandler = () => this.endDrag(mouseMoveHandler, mouseUpHandler)
      
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
      document.addEventListener('touchmove', mouseMoveHandler)
      document.addEventListener('touchend', mouseUpHandler)
    },
    
    // 拖拽过程中
    onDrag(event) {
      const currentY = event.clientY || event.touches[0].clientY
      const diff = currentY - this.dragStartY
      
      console.log('Dragging:', diff)
      
      // 向下拖拽超过20px，展开日历
      if (diff < -20) {
        this.isCalendarCollapsed = false
      }
      // 向上拖拽超过20px，收起日历
      else if (diff > 20) {
        this.isCalendarCollapsed = true
      }
    },
    
    // 拖拽结束
    endDrag(moveHandler, upHandler) {
      console.log('Drag ended')
      // 移除拖拽事件监听
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', upHandler)
      document.removeEventListener('touchmove', moveHandler)
      document.removeEventListener('touchend', upHandler)
    }
  },
  mounted() {
    // 组件挂载时重新加载日记数据
    this.$store.dispatch('loadDiaries')
    
    // 添加鼠标滚轮事件监听
    console.log('Adding wheel event listener to window')
    this.wheelHandler = this.handleWheel.bind(this)
    window.addEventListener('wheel', this.wheelHandler)
    
    // 添加触摸事件监听（用于移动设备）
    console.log('Adding touch events listeners')
    this.touchHandler = this.handleTouch.bind(this)
    window.addEventListener('touchstart', this.touchHandler)
    window.addEventListener('touchmove', this.touchHandler)
  },
  
  beforeDestroy() {
    // 组件销毁前移除事件监听，避免内存泄漏
    window.removeEventListener('wheel', this.wheelHandler)
    window.removeEventListener('touchstart', this.touchHandler)
    window.removeEventListener('touchmove', this.touchHandler)
  }
}
</script>

<style scoped>
.homepage {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 日历右上角写日记按钮样式 */
.calendar-diary-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
  z-index: 99;
}

.calendar-diary-btn:hover {
  background-color: #45a049;
}

/* 日历组件样式 */
  .calendar-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 24px;
    transition: all 0.3s ease;
    position: relative;
    width: 100%;
    box-sizing: border-box;
  }

  .calendar-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .calendar-nav {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .calendar-header h2 {
    margin: 0;
    font-size: 18px;
    color: #333;
    min-width: 120px;
    text-align: center;
  }
  


.calendar-nav-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  /* 拖拽控制区域样式 */
  .calendar-drag-handle {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    cursor: grab;
    user-select: none;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.8);
    transition: background-color 0.2s;
    z-index: 100;
  }
  
  .calendar-drag-handle:hover {
    background-color: rgba(255, 255, 255, 1);
  }
  
  .calendar-drag-handle:active {
    cursor: grabbing;
  }
  
  .drag-icon {
    font-size: 18px;
    color: #666;
  }
  


.calendar-nav-btn:hover {
  background-color: #f5f5f5;
}

.calendar-grid {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.calendar-weekday {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding: 8px;
  font-weight: bold;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  
  /* 单周视图样式 */
  .calendar-week-view {
    overflow: hidden;
  }
  
  .calendar-week-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
}

.calendar-day:not(.other-month):hover {
  background-color: #f0f0f0;
}

.calendar-day.other-month {
  color: #ccc;
  cursor: default;
}

.calendar-day.has-diary:not(.other-month) {
  font-weight: bold;
}

.calendar-day.has-diary:not(.other-month)::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #4CAF50;
}

.calendar-day.selected:not(.other-month) {
    background-color: #4CAF50;
    color: white;
  }
  
  .calendar-day.today:not(.selected):not(.other-month) {
    border: 2px solid #4CAF50;
    font-weight: bold;
  }

.date-filter-indicator {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #e8f5e9;
  border-radius: 4px;
  font-size: 14px;
}

.clear-filter-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.clear-filter-btn:hover {
  background-color: #45a049;
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