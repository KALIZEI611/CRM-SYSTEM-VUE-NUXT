<script setup lang="ts">
import { useSeoMeta } from "nuxt/app";
import { useHelpCenter } from "~/Util/useHelpCenter";

const {
  searchQuery,
  activeCategory,
  activeArticle,
  searchResults,
  showFeedbackModal,
  userFeedback,
  feedbackForm,
  categories,
  quickActions,
  articles,
  popularArticles,
  currentCategoryName,
  currentArticles,
  searchArticles,
  setActiveCategory,
  openArticle,
  closeArticle,
  getCategoryName,
  getArticleById,
  formatDate,
  sendFeedback,
  openFeedbackModal,
  closeFeedbackModal,
  submitFeedback,
} = useHelpCenter();

useSeoMeta({
  title: "Справочный центр",
});
</script>

<template>
  <div
    class="help-center min-h-screen bg-background text-foreground flex flex-col"
  >
    <div class="px-4 md:px-6 pt-4 md:pt-6">
      <div
        class="max-w-8xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8"
      >
        <h1 class="text-2xl md:text-3xl font-bold text-white">
          Справочный центр
        </h1>
        <div class="relative w-full md:w-96">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по справочному центру..."
              class="w-full pl-4 pr-10 py-3 bg-card border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              @input="searchArticles"
            />
            <button
              @click="searchArticles"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon
                name="fluent:search-20-filled"
                class="mr-3 mt-1"
                size="20"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 px-4 md:px-6 pb-4 md:pb-6">
      <div class="max-w-8xl mx-auto h-full">
        <div class="flex flex-col lg:flex-row gap-6 h-full">
          <div class="lg:w-64 flex-shrink-0">
            <div class="bg-card rounded-xl border border-border p-4 h-full">
              <nav>
                <ul class="space-y-1">
                  <li
                    v-for="category in categories"
                    :key="category.id"
                    :class="[
                      'px-3 py-2 rounded-lg cursor-pointer transition-colors flex justify-between items-center',
                      activeCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                    ]"
                    @click="setActiveCategory(category.id)"
                  >
                    <span>{{ category.name }}</span>
                    <span
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        activeCategory === category.id
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-muted text-muted-foreground',
                      ]"
                    >
                      {{ category.count }}
                    </span>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div class="flex-1 min-h-0">
            <div
              class="bg-card rounded-xl border border-border p-4 md:p-6 h-full overflow-y-auto"
            >
              <div v-if="searchResults.length > 0">
                <h2 class="text-xl font-semibold text-foreground mb-4">
                  Результаты поиска ({{ searchResults.length }})
                </h2>
                <div class="space-y-3">
                  <div
                    v-for="result in searchResults"
                    :key="result.id"
                    @click="() => openArticle(result)"
                    class="p-4 border border-input rounded-lg hover:border-primary/50 cursor-pointer transition-all hover:bg-primary/5 group"
                  >
                    <h4
                      class="font-medium text-foreground group-hover:text-primary transition-colors"
                    >
                      {{ result.title }}
                    </h4>
                    <p class="text-sm text-muted-foreground mt-1 mb-2">
                      {{ result.excerpt }}
                    </p>
                    <span
                      class="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                    >
                      {{ getCategoryName(result.category) }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-else-if="!activeArticle">
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-foreground mb-4">
                    Как начать работу?
                  </h2>
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    <div
                      v-for="action in quickActions"
                      :key="action.id"
                      @click="() => openArticle(action.article)"
                      class="bg-muted/30 border border-input rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                    >
                      <div class="text-2xl mb-3">{{ action.icon }}</div>
                      <h4
                        class="font-medium text-foreground mb-2 group-hover:text-primary transition-colors"
                      >
                        {{ action.title }}
                      </h4>
                      <p class="text-sm text-muted-foreground">
                        {{ action.description }}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 class="text-xl font-semibold text-foreground mb-4">
                    {{ currentCategoryName }}
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="article in currentArticles"
                      :key="article.id"
                      @click="() => openArticle(article)"
                      class="border border-input rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                    >
                      <h4
                        class="font-medium text-foreground mb-2 group-hover:text-primary transition-colors"
                      >
                        {{ article.title }}
                      </h4>
                      <p class="text-sm text-muted-foreground mb-3">
                        {{ article.excerpt }}
                      </p>
                      <div
                        class="flex items-center gap-3 text-xs text-muted-foreground"
                      >
                        <span class="flex items-center gap-1">
                          <Icon name="fluent:timer-16-regular" size="20" />
                          {{ article.readTime }} мин
                        </span>
                        <span
                          v-if="article.updated"
                          class="flex items-center gap-1"
                        >
                          <Icon name="radix-icons:update" size="16" />
                          {{ formatDate(article.updated) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="activeArticle" class="article-detail">
                <div class="mb-6">
                  <button
                    @click="closeArticle"
                    class="flex items-center gap-2 text-primary hover:text-primary/80 mb-2 transition-colors"
                  >
                    <Icon name="radix-icons:arrow-left" size="20" />
                    Назад к статьям
                  </button>
                  <h2 class="text-2xl font-bold text-foreground mb-4">
                    {{ activeArticle.title }}
                  </h2>
                  <div
                    class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span class="px-2 py-1 bg-muted rounded">{{
                      getCategoryName(activeArticle.category)
                    }}</span>
                    <span class="flex items-center gap-1">
                      <Icon name="fluent:timer-16-regular" size="24" />
                      {{ activeArticle.readTime }} мин чтения
                    </span>
                    <span
                      v-if="activeArticle.updated"
                      class="flex items-center gap-1"
                    >
                      <Icon name="radix-icons:update" size="20" />
                      Обновлено: {{ formatDate(activeArticle.updated) }}
                    </span>
                  </div>
                </div>

                <div class="prose prose-invert max-w-none mb-8">
                  <div
                    class="article-content"
                    v-html="activeArticle.content"
                  ></div>
                </div>

                <div class="space-y-6 pt-6 border-t border-border">
                  <div class="feedback">
                    <p class="text-foreground mb-3">
                      Была ли эта статья полезной?
                    </p>
                    <div class="flex gap-2">
                      <button
                        @click="() => sendFeedback(true)"
                        :class="[
                          'px-4 py-2 rounded-lg border transition-all',
                          userFeedback === true
                            ? 'bg-lime-700 border-lime-700 text-white'
                            : 'bg-muted border-input text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                        ]"
                      >
                        <span class="flex items-center gap-2">
                          <Icon
                            name="mdi-light:thumb-up"
                            class="fade-in-100 fade-out-0"
                            size="25"
                          />
                          Да
                        </span>
                      </button>
                      <button
                        @click="() => sendFeedback(false)"
                        :class="[
                          'px-4 py-2 rounded-lg border transition-all',
                          userFeedback === false
                            ? 'bg-red-800 border-red-800 text-white'
                            : 'bg-muted border-input text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                        ]"
                      >
                        <span class="flex items-center gap-2">
                          <Icon
                            name="mdi-light:thumb-down"
                            class="fade-in-100 fade-out-0"
                            size="25"
                          />
                          Нет
                        </span>
                      </button>
                    </div>
                  </div>

                  <div class="related-articles">
                    <h4 class="font-semibold text-foreground mb-3">
                      Связанные статьи
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="related in activeArticle.related"
                        :key="related"
                        @click="() => openArticle(related)"
                        class="px-3 py-2 bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors hover:bg-muted/80 text-sm"
                      >
                        {{ getArticleById(related)?.title }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="openFeedbackModal"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-40"
    >
      <Icon name="fluent:chat-20-filled" size="20" />
    </button>

    <div
      v-if="showFeedbackModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeFeedbackModal"
    >
      <div
        class="bg-card rounded-xl border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-lg font-semibold text-foreground mb-4">
          Обратная связь
        </h3>
        <form @submit.prevent="submitFeedback">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2"
                >Тема</label
              >
              <select
                v-model="feedbackForm.type"
                class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="question">Вопрос</option>
                <option value="suggestion">Предложение</option>
                <option value="problem">Проблема</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2"
                >Сообщение</label
              >
              <textarea
                v-model="feedbackForm.message"
                rows="4"
                placeholder="Опишите вашу проблему или предложение..."
                class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2"
                >Email для ответа</label
              >
              <input
                v-model="feedbackForm.email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeFeedbackModal"
                class="px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Отправить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.prose {
  color: var(--foreground);
}

.prose :where(h1, h2, h3, h4, h5, h6) {
  color: var(--foreground);
}

.prose :where(p, ul, ol, li) {
  color: var(--muted-foreground);
}

.article-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.75rem;
}

.article-content :deep(p) {
  margin-bottom: 0.5rem;
  color: color-mix(in srgb, var(--foreground) 90%, transparent);
}

.article-content :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  color: color-mix(in srgb, var(--foreground) 90%, transparent);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.fixed button:hover {
  animation: pulse 0.5s ease-in-out;
}
</style>
