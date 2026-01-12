import { ref, computed, type Ref } from "vue";
import type {
  Category,
  Article,
  QuickAction,
  PopularArticle,
  FeedbackForm,
} from "./types";

export function useHelpCenter() {
  const searchQuery: Ref<string> = ref("");
  const activeCategory: Ref<string> = ref("getting-started");
  const activeArticle: Ref<Article | null> = ref(null);
  const searchResults: Ref<Article[]> = ref([]);
  const showFeedbackModal: Ref<boolean> = ref(false);
  const userFeedback: Ref<boolean | null> = ref(null);

  const feedbackForm: Ref<FeedbackForm> = ref({
    type: "question",
    message: "",
    email: "",
  });

  const categories: Category[] = [
    { id: "getting-started", name: "Начало работы", count: 3 },
    { id: "clients", name: "Работа с клиентами", count: 1 },
    { id: "tasks", name: "Задачи и проекты", count: 0 },
    { id: "analytics", name: "Аналитика и отчеты", count: 0 },
    { id: "settings", name: "Настройки системы", count: 1 },
    { id: "billing", name: "Оплата и биллинг", count: 0 },
    { id: "api", name: "API и интеграции", count: 0 },
    { id: "troubleshooting", name: "Решение проблем", count: 0 },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 1,
      icon: "📋",
      title: "Создать первую задачу",
      description: "Узнайте как создавать и назначать задачи",
      article: 101,
    },
    {
      id: 2,
      icon: "👥",
      title: "Добавить клиента",
      description: "Как добавить нового клиента в систему",
      article: 102,
    },
    {
      id: 3,
      icon: "📊",
      title: "Создать отчет",
      description: "Генерация отчетов по продажам",
      article: 103,
    },
    {
      id: 4,
      icon: "⚙️",
      title: "Настройка уведомлений",
      description: "Настройте email и push уведомления",
      article: 104,
    },
  ];

  const articles: Article[] = [
    {
      id: 101,
      title: "Как создать свою первую задачу",
      excerpt: "Пошаговое руководство по созданию задач в CRM",
      category: "getting-started",
      content:
        '<h3 class="text-xl font-semibold text-foreground mb-3">Создание задачи</h3><p class="mb-2 text-foreground/90">1. Нажмите кнопку "Новая задача" в верхней панели</p><p class="mb-2 text-foreground/90">2. Заполните основные поля: название, описание, сроки</p><p class="mb-2 text-foreground/90">3. Назначьте ответственного сотрудника</p><p class="mb-2 text-foreground/90">4. Добавьте теги для удобной фильтрации</p>',
      readTime: 3,
      updated: new Date().toISOString().split("T")[0],
      related: [102, 103],
    },
    {
      id: 102,
      title: "Добавление нового клиента",
      excerpt: "Инструкция по добавлению клиентов в базу",
      category: "getting-started",
      content:
        '<h3 class="text-xl font-semibold text-foreground mb-3">Добавление клиента</h3><p class="mb-2 text-foreground/90">1. Перейдите в раздел "Клиенты"</p><p class="mb-2 text-foreground/90">2. Нажмите кнопку "Добавить клиента"</p><p class="mb-2 text-foreground/90">3. Заполните контактную информацию</p><p class="mb-2 text-foreground/90">4. Добавьте дополнительные поля при необходимости</p>',
      readTime: 5,
      updated: new Date().toISOString().split("T")[0], 
      related: [101, 104],
    },
    {
      id: 201,
      title: "Сегментация клиентской базы",
      excerpt: "Как разделить клиентов по группам для эффективной работы",
      category: "clients",
      content:
        '<h3 class="text-xl font-semibold text-foreground mb-3">Сегментация клиентской базы</h3><p class="mb-2 text-foreground/90">Сегментация позволяет эффективно работать с разными группами клиентов.</p><p class="mb-2 text-foreground/90">Основные методы сегментации:</p><ul class="list-disc pl-5 mb-2 text-foreground/90"><li>По активности</li><li>По объему покупок</li><li>По типу бизнеса</li><li>По региону</li></ul>',
      readTime: 7,
      updated: new Date().toISOString().split("T")[0], 
      related: [202, 203],
    },
    {
      id: 103,
      title: "Создание и настройка отчетов",
      excerpt: "Генерация отчетов по продажам и активности",
      category: "getting-started",
      content:
        '<h3 class="text-xl font-semibold text-foreground mb-3">Создание отчетов</h3><p class="mb-2 text-foreground/90">1. Перейдите в раздел "Аналитика"</p><p class="mb-2 text-foreground/90">2. Выберите тип отчета</p><p class="mb-2 text-foreground/90">3. Настройте параметры и фильтры</p><p class="mb-2 text-foreground/90">4. Экспортируйте или сохраните отчет</p>',
      readTime: 4,
      updated: new Date().toISOString().split("T")[0],  
      related: [101, 201],
    },
    {
      id: 104,
      title: "Настройка уведомлений",
      excerpt: "Настройте email и push уведомления для вашей команды",
      category: "settings",
      content:
        '<h3 class="text-xl font-semibold text-foreground mb-3">Настройка уведомлений</h3><p class="mb-2 text-foreground/90">Настройте систему уведомлений чтобы быть в курсе важных событий.</p><p class="mb-2 text-foreground/90">Доступные типы уведомлений:</p><ul class="list-disc pl-5 mb-2 text-foreground/90"><li>Email уведомления</li><li>Push уведомления в браузере</li></ul>',
      readTime: 6,
      updated: new Date().toISOString().split("T")[0], 
      related: [102, 103],
    },
  ];

  const popularArticles: PopularArticle[] = [
    { id: 101, title: "Как создать свою первую задачу" },
    { id: 102, title: "Добавление нового клиента" },
    { id: 201, title: "Сегментация клиентской базы" },
    { id: 104, title: "Настройка уведомлений" },
  ];

  const currentCategoryName = computed(() => {
    const category = categories.find((c) => c.id === activeCategory.value);
    return category ? category.name : "";
  });

  const currentArticles = computed(() => {
    return articles.filter(
      (article) => article.category === activeCategory.value
    );
  });

  const searchArticles = (): void => {
    if (!searchQuery.value.trim()) {
      searchResults.value = [];
      return;
    }

    const query = searchQuery.value.toLowerCase();
    searchResults.value = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
    );
  };

  const setActiveCategory = (categoryId: string): void => {
    activeCategory.value = categoryId;
    activeArticle.value = null;
    searchResults.value = [];
  };

  const openArticle = (article: Article | number): void => {
    if (typeof article === "number") {
      activeArticle.value = articles.find((a) => a.id === article) || null;
    } else {
      activeArticle.value = article;
    }
  };

  const closeArticle = (): void => {
    activeArticle.value = null;
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  const getArticleById = (id: number): Article | undefined => {
    return articles.find((article) => article.id === id);
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  const sendFeedback = (isUseful: boolean): void => {
    userFeedback.value = isUseful;
    setTimeout(() => {
      userFeedback.value = null;
    }, 2000);
  };

  const openFeedbackModal = (): void => {
    showFeedbackModal.value = true;
  };

  const closeFeedbackModal = (): void => {
    showFeedbackModal.value = false;
    feedbackForm.value = {
      type: "question",
      message: "",
      email: "",
    };
  };

  const submitFeedback = (): void => {
    console.log("Feedback submitted:", feedbackForm.value);
    closeFeedbackModal();
    alert("Спасибо за ваше сообщение! Мы ответим вам в ближайшее время.");
  };

  return {
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
  };
}

export type UseHelpCenterReturn = ReturnType<typeof useHelpCenter>;
