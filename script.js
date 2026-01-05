// ==========================================
// Hybrid Vulnerability Test Data
// ==========================================

const testData = {
  questions: [
    // Block A Questions (6 questions)
    {
      id: 1,
      text: "Когда незнакомый человек начинает со мной активно общаться онлайн (чаты, соцсети, мессенджеры)…",
      block: "A",
      category: "Новые знакомства и доверие",
      options: [
        { letter: "A", text: "Я быстро открываюсь, делюсь личной информацией" },
        { letter: "B", text: "Сначала осторожничаю, но если человек симпатичен — доверяю" },
        { letter: "C", text: "Держусь настороже, проверяю информацию" }
      ]
    },
    {
      id: 2,
      text: "Если кто-то предлагает выгодное сотрудничество или инвестицию…",
      block: "A",
      category: "Финансовые решения",
      options: [
        { letter: "A", text: "Сразу соглашаюсь, если звучит заманчиво" },
        { letter: "B", text: "Интересуюсь деталями, но интуитивно решаю" },
        { letter: "C", text: "Требую документы, проверяю репутацию" }
      ]
    },
    {
      id: 3,
      text: "При знакомстве на вечеринке или мероприятии…",
      block: "A",
      category: "Социальные взаимодействия",
      options: [
        { letter: "A", text: "Легко вхожу в контакт, делюсь историями из жизни" },
        { letter: "B", text: "Сначала наблюдаю, потом постепенно открываюсь" },
        { letter: "C", text: "Остаюсь сдержанным, оцениваю ситуацию" }
      ]
    },
    {
      id: 4,
      text: "Когда мне нужна помощь или поддержка…",
      block: "A",
      category: "Эмоциональная зависимость",
      options: [
        { letter: "A", text: "Обращаюсь к первому встречному, легко доверяю" },
        { letter: "B", text: "Выбираю проверенных людей, но быстро привязываюсь" },
        { letter: "C", text: "Стараюсь решать самостоятельно, редко прошу помощи" }
      ]
    },
    {
      id: 5,
      text: "При получении неожиданного подарка или внимания…",
      block: "A",
      category: "Отклики на одобрение",
      options: [
        { letter: "A", text: "Сразу принимаю с благодарностью, чувствую радость" },
        { letter: "B", text: "Сначала удивляюсь, потом оцениваю мотивы" },
        { letter: "C", text: "Осторожно отношусь, ищу скрытые цели" }
      ]
    },
    {
      id: 6,
      text: "В отношениях с новыми людьми я чаще всего…",
      block: "A",
      category: "Поведенческие паттерны",
      options: [
        { letter: "A", text: "Открываюсь быстро, делюсь самым сокровенным" },
        { letter: "B", text: "Постепенно строю доверие, но могу быть импульсивным" },
        { letter: "C", text: "Долго изучаю человека, редко раскрываюсь полностью" }
      ]
    },
    
    // Block B Questions (4 questions)
    {
      id: 7,
      text: "Когда сталкиваюсь с конфликтом интересов…",
      block: "B",
      category: "Решение конфликтов",
      options: [
        { letter: "A", text: "Избегаю противостояния, уступаю ради мира" },
        { letter: "B", text: "Стараюсь найти компромисс, но часто сомневаюсь" },
        { letter: "C", text: "Отстаиваю свою позицию, даже если это вызывает напряжение" }
      ]
    },
    {
      id: 8,
      text: "При необходимости принимать сложные решения…",
      block: "B",
      category: "Когнитивные процессы",
      options: [
        { letter: "A", text: "Действую интуитивно, доверяя первому порыву" },
        { letter: "B", text: "Колеблюсь между разными вариантами" },
        { letter: "C", text: "Анализирую все плюсы и минусы, долго решаю" }
      ]
    },
    {
      id: 9,
      text: "Когда меня критикуют или указывают на ошибки…",
      block: "B",
      category: "Реакция на обратную связь",
      options: [
        { letter: "A", text: "Сильно переживаю, чувствую себя уязвленным" },
        { letter: "B", text: "Сначала обижаюсь, потом пытаюсь понять" },
        { letter: "C", text: "Холодно анализирую, не принимаю близко к сердцу" }
      ]
    },
    {
      id: 10,
      text: "В стрессовых ситуациях я обычно…",
      block: "B",
      category: "Стресс-толерантность",
      options: [
        { letter: "A", text: "Теряю контроль, действую импульсивно" },
        { letter: "B", text: "Колеблюсь между разными реакциями" },
        { letter: "C", text: "Сохраняю хладнокровие, рационально мыслю" }
      ]
    },
    
    // Block C Questions (5 questions)
    {
      id: 11,
      text: "При планировании своих действий я…",
      block: "C",
      category: "Стратегическое мышление",
      options: [
        { letter: "A", text: "Действую спонтанно, без долгосрочных планов" },
        { letter: "B", text: "Иногда планирую, но часто отклоняюсь от графика" },
        { letter: "C", text: "Всегда продумываю стратегию на несколько шагов вперед" }
      ]
    },
    {
      id: 12,
      text: "Когда нужно оценить чужие мотивы…",
      block: "C",
      category: "Анализ поведения",
      options: [
        { letter: "A", text: "Доверяю внешним проявлениям, не задумываюсь глубоко" },
        { letter: "B", text: "Иногда замечаю несоответствия, но не всегда интерпретирую правильно" },
        { letter: "C", text: "Всегда ищу скрытые смыслы и истинные цели" }
      ]
    },
    {
      id: 13,
      text: "В сложных социальных ситуациях я…",
      block: "C",
      category: "Социальная осведомленность",
      options: [
        { letter: "A", text: "Реагирую эмоционально, не анализирую динамику" },
        { letter: "B", text: "Замечаю некоторые нюансы, но не всегда понимаю полностью" },
        { letter: "C", text: "Читаю между строк, понимаю истинные намерения" }
      ]
    },
    {
      id: 14,
      text: "При оценке информации из разных источников…",
      block: "C",
      category: "Критическое мышление",
      options: [
        { letter: "A", text: "Принимаю информацию как есть, не проверяю" },
        { letter: "B", text: "Иногда сомневаюсь, но не всегда проверяю факты" },
        { letter: "C", text: "Всегда перепроверяю, ищу подтверждения" }
      ]
    },
    {
      id: 15,
      text: "В межличностных отношениях я…",
      block: "C",
      category: "Психологическая зрелость",
      options: [
        { letter: "A", text: "Часто попадаю в ловушки из-за доверчивости" },
        { letter: "B", text: "Иногда вижу манипуляции, но не всегда защищаюсь" },
        { letter: "C", text: "Редко поддаюсь манипуляциям, умею защитить себя" }
      ]
    }
  ],
  
  profiles: {
    A_high_B_low_C_low: {
      emoji: "💝",
      name: "Эмоциональный эмпат",
      description: "Ваша сильная сторона — эмпатия и способность устанавливать глубокие связи.",
      strengths: [
        "Высокая эмпатия и эмоциональная отзывчивость",
        "Способность создавать теплые, искренние отношения",
        "Чувствительность к потребностям других людей",
        "Природный обаятельный характер"
      ],
      vulnerabilities: [
        "Склонность к эмоциональной эксплуатации",
        "Сложности с установлением границ",
        "Чрезмерная доверчивость к незнакомцам",
        "Риск финансовых и личных потерь"
      ],
      recommendations: [
        "Развивайте навыки проверки информации и критического мышления",
        "Учитесь устанавливать здоровые границы в отношениях",
        "Практикуйте паузу между импульсом и действием",
        "Развивайте финансовую грамотность и осторожность"
      ]
    },
    
    A_high_B_medium_C_low: {
      emoji: "🎭",
      name: "Интуитивный коммуникатор",
      description: "Вы хорошо читаете людей, но иногда доверяете интуиции слишком быстро.",
      strengths: [
        "Развитая интуиция и эмоциональный интеллект",
        "Умение находить общий язык с разными людьми",
        "Способность к быстрому установлению контакта",
        "Харизматичное поведение"
      ],
      vulnerabilities: [
        "Склонность к импульсивным решениям",
        "Неустойчивость в сложных ситуациях",
        "Риск манипуляций через эмоциональное давление",
        "Трудности с долгосрочным планированием"
      ],
      recommendations: [
        "Развивайте системное мышление и стратегическое планирование",
        "Учитесь анализировать ситуации более глубоко",
        "Практикуйте техники управления импульсами",
        "Развивайте навыки критической оценки информации"
      ]
    },
    
    A_high_B_high_C_medium: {
      emoji: "⚖️",
      name: "Сбалансированный аналитик",
      description: "Вы сочетаете эмпатию с рациональным подходом — это ваша сила.",
      strengths: [
        "Оптимальный баланс между сердцем и разумом",
        "Способность принимать взвешенные решения",
        "Устойчивость к манипуляциям при сохранении открытости",
        "Эффективная коммуникация и лидерские качества"
      ],
      vulnerabilities: [
        "Иногда чрезмерная осторожность может мешать",
        "Склонность к перегрузке анализом простых ситуаций",
        "Риск упустить возможности из-за избыточной проверки"
      ],
      recommendations: [
        "Доверяйте своей интуиции в простых ситуациях",
        "Развивайте гибкость в подходах к разным людям",
        "Учитесь различать ситуации, требующие анализа и интуиции",
        "Практикуйте баланс между осторожностью и открытым подходом"
      ]
    },
    
    A_low_B_high_C_high: {
      emoji: "🛡️",
      name: "Стратегический защитник",
      description: "Ваша главная сила — критическое мышление и психологическая защита.",
      strengths: [
        "Высокий уровень критического мышления",
        "Отличная способность распознавать манипуляции",
        "Сильная психологическая устойчивость",
        "Эффективные защитные механизмы"
      ],
      vulnerabilities: [
        "Сложности с установлением близких отношений",
        "Склонность к изоляции и недоверию",
        "Риск упустить искренние возможности",
        "Чрезмерная осторожность может ограничивать опыт"
      ],
      recommendations: [
        "Развивайте навыки эмпатии и открытой коммуникации",
        "Учитесь различать реальную опасность и нормальные риски",
        "Практикуйте постепенное раскрытие в безопасных ситуациях",
        "Развивайте способность доверять проверенным людям"
      ]
    }
  }
};

// ==========================================
// Main Application Logic
// ==========================================

class HybridTest {
  constructor() {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.blockScores = { A: 0, B: 0, C: 0 };
    this.initializeElements();
    this.bindEvents();
    this.showQuestion();
  }
  
  initializeElements() {
    // Test screen elements
    this.testScreen = document.getElementById('test-screen');
    this.resultScreen = document.getElementById('result-screen');
    this.backButton = document.getElementById('back-btn');
    this.resetButton = document.getElementById('reset-btn');
    this.backToTestsButton = document.getElementById('back-to-tests-btn');
    this.questionText = document.getElementById('question-text');
    this.blockBadge = document.getElementById('block-badge');
    this.categoryLabel = document.getElementById('category-label');
    this.optionsContainer = document.getElementById('options');
    this.progressText = document.getElementById('progress-text');
    
    // Block progress elements
    this.blockA = document.getElementById('block-a');
    this.blockB = document.getElementById('block-b');
    this.blockC = document.getElementById('block-c');
    this.blockACount = document.getElementById('block-a-count');
    this.blockBCount = document.getElementById('block-b-count');
    this.blockCCount = document.getElementById('block-c-count');
    this.blockAFill = document.getElementById('block-a-fill');
    this.blockBFill = document.getElementById('block-b-fill');
    this.blockCFill = document.getElementById('block-c-fill');
    
    // Result screen elements
    this.profileEmoji = document.getElementById('profile-emoji');
    this.profileName = document.getElementById('profile-name');
    this.profileDescription = document.getElementById('profile-description');
    this.strengthsList = document.getElementById('strengths-list');
    this.vulnerabilitiesList = document.getElementById('vulnerabilities-list');
    this.recommendationsList = document.getElementById('recommendations-list');
    this.summaryBlocks = document.getElementById('summary-blocks');
  }
  
  bindEvents() {
    this.backButton.addEventListener('click', () => this.goBack());
    this.resetButton.addEventListener('click', () => this.resetTest());
    this.backToTestsButton.addEventListener('click', () => this.goBack());
  }
  
  showQuestion() {
    const question = testData.questions[this.currentQuestionIndex];
    if (!question) {
      this.showResults();
      return;
    }
    
    // Update question content
    this.questionText.textContent = question.text;
    this.blockBadge.textContent = this.getBlockName(question.block);
    this.categoryLabel.textContent = question.category;
    
    // Update progress
    this.updateProgress();
    
    // Update block highlights
    this.updateBlockHighlights(question.block);
    
    // Generate options
    this.generateOptions(question.options);
  }
  
  getBlockName(block) {
    const names = {
      A: "Личностный профиль",
      B: "Когнитивные особенности",
      C: "Защитные механизмы"
    };
    return names[block] || "Неизвестный блок";
  }
  
  updateProgress() {
    const current = this.currentQuestionIndex + 1;
    const total = testData.questions.length;
    this.progressText.textContent = `${current} / ${total}`;
    
    // Update block counts and progress bars
    this.updateBlockProgress();
  }
  
  updateBlockProgress() {
    const answeredQuestions = Object.keys(this.answers);
    
    // Count answers for each block
    const blockCounts = { A: 0, B: 0, C: 0 };
    answeredQuestions.forEach(qId => {
      const question = testData.questions.find(q => q.id == qId);
      if (question) {
        blockCounts[question.block]++;
      }
    });
    
    // Update displays
    this.blockACount.textContent = `${blockCounts.A}/6`;
    this.blockBCount.textContent = `${blockCounts.B}/4`;
    this.blockCCount.textContent = `${blockCounts.C}/5`;
    
    // Update progress bars
    this.blockAFill.style.width = `${(blockCounts.A / 6) * 100}%`;
    this.blockBFill.style.width = `${(blockCounts.B / 4) * 100}%`;
    this.blockCFill.style.width = `${(blockCounts.C / 5) * 100}%`;
  }
  
  updateBlockHighlights(currentBlock) {
    // Remove active class from all blocks
    this.blockA.classList.remove('active');
    this.blockB.classList.remove('active');
    this.blockC.classList.remove('active');
    
    // Add active class to current block
    if (currentBlock === 'A') {
      this.blockA.classList.add('active');
    } else if (currentBlock === 'B') {
      this.blockB.classList.add('active');
    } else if (currentBlock === 'C') {
      this.blockC.classList.add('active');
    }
  }
  
  generateOptions(options) {
    this.optionsContainer.innerHTML = '';
    
    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'option-button';
      button.innerHTML = `
        <div class="letter-circle">${option.letter}</div>
        <div class="option-text">${option.text}</div>
      `;
      
      button.addEventListener('click', () => {
        this.selectOption(option.letter);
      });
      
      this.optionsContainer.appendChild(button);
    });
  }
  
  selectOption(letter) {
    const question = testData.questions[this.currentQuestionIndex];
    this.answers[question.id] = letter;
    
    // Update block score
    this.blockScores[question.block] += this.getScoreValue(letter);
    
    // Move to next question
    this.currentQuestionIndex++;
    this.showQuestion();
  }
  
  getScoreValue(letter) {
    // A = 3 points, B = 2 points, C = 1 point
    const values = { A: 3, B: 2, C: 1 };
    return values[letter] || 0;
  }
  
  showResults() {
    // Hide test screen, show result screen
    this.testScreen.classList.add('hidden');
    this.resultScreen.classList.remove('hidden');
    
    // Determine profile
    const profile = this.determineProfile();
    
    // Update result content
    this.profileEmoji.textContent = profile.emoji;
    this.profileName.textContent = profile.name;
    this.profileDescription.textContent = profile.description;
    
    // Populate lists
    this.populateList(this.strengthsList, profile.strengths);
    this.populateList(this.vulnerabilitiesList, profile.vulnerabilities);
    this.populateList(this.recommendationsList, profile.recommendations);
    
    // Show summary blocks
    this.showSummaryBlocks();
  }
  
  determineProfile() {
    const scores = this.blockScores;
    
    // Normalize scores (average per question)
    const normalizedScores = {
      A: scores.A / 6,  // 6 questions in block A
      B: scores.B / 4,  // 4 questions in block B
      C: scores.C / 5   // 5 questions in block C
    };
    
    // Determine profile based on normalized scores
    if (normalizedScores.A > 2 && normalizedScores.B < 1.5 && normalizedScores.C < 1.5) {
      return testData.profiles.A_high_B_low_C_low;
    } else if (normalizedScores.A > 2 && normalizedScores.B >= 1.5 && normalizedScores.B < 2.5 && normalizedScores.C < 2) {
      return testData.profiles.A_high_B_medium_C_low;
    } else if (normalizedScores.A > 2 && normalizedScores.B >= 2 && normalizedScores.C >= 1.5) {
      return testData.profiles.A_high_B_high_C_medium;
    } else if (normalizedScores.A < 2 && normalizedScores.B >= 2 && normalizedScores.C >= 2.5) {
      return testData.profiles.A_low_B_high_C_high;
    }
    
    // Default fallback
    return testData.profiles.A_high_B_low_C_low;
  }
  
  populateList(element, items) {
    element.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      element.appendChild(li);
    });
  }
  
  showSummaryBlocks() {
    this.summaryBlocks.innerHTML = '';
    
    const blocks = ['A', 'B', 'C'];
    const labels = {
      A: 'Личностный профиль',
      B: 'Когнитивные особенности',
      C: 'Защитные механизмы'
    };
    
    blocks.forEach(block => {
      const div = document.createElement('div');
      div.className = 'summary-block';
      div.innerHTML = `
        <h4>${labels[block]}</h4>
        <div class="counts">
          <span class="a">A: ${this.countAnswers(block, 'A')}</span> | 
          <span class="b">B: ${this.countAnswers(block, 'B')}</span> | 
          <span class="c">C: ${this.countAnswers(block, 'C')}</span>
        </div>
      `;
      this.summaryBlocks.appendChild(div);
    });
  }
  
  countAnswers(block, letter) {
    return Object.entries(this.answers)
      .filter(([qId, ans]) => {
        const question = testData.questions.find(q => q.id == qId);
        return question && question.block === block && ans === letter;
      })
      .length;
  }
  
  goBack() {
    // In a real app, this would navigate back to tests page
    alert('Возвращаемся к списку тестов');
  }
  
  resetTest() {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.blockScores = { A: 0, B: 0, C: 0 };
    
    // Show test screen, hide result screen
    this.testScreen.classList.remove('hidden');
    this.resultScreen.classList.add('hidden');
    
    this.showQuestion();
  }
}

// Initialize the test when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HybridTest();
});