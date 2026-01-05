const profiles = [
  {
    id: "empath",
    name: "Эмоциональный эмпат",
    emoji: "💝",
    description: "Ваша сильная сторона — эмпатия и способность устанавливать глубокие связи. Однако эти же качества делают вас уязвимым к романтическим и социальным мошенничествам, где манипуляторы эксплуатируют вашу готовность помогать.",
    strengths: [
      "Глубокая эмпатия и эмоциональный интеллект",
      "Способность создавать доверительные отношения",
      "Отзывчивость и готовность помочь"
    ],
    vulnerabilities: [
      "Романтические скамы (catfishing, love scams)",
      "Схемы «помоги родственнику в беде»",
      "Благотворительные мошенничества"
    ],
    recommendations: [
      "Установите правило «24 часа» — никаких переводов денег без суточной паузы",
      "Всегда проверяйте личность через альтернативный канал связи",
      "Помните: настоящая любовь и дружба не требуют денег в первые месяцы"
    ],
    colorClass: "pink"
  },
  {
    id: "investor",
    name: "Импульсивный инвестор",
    emoji: "📈",
    description: "Вы склонны к риску и быстрым решениям, особенно когда видите возможность заработка. Это делает вас целью для инвестиционных пирамид, криптоскамов и схем «бизнес под ключ».",
    strengths: [
      "Готовность к действию и решительность",
      "Умение видеть возможности",
      "Не боитесь рисковать"
    ],
    vulnerabilities: [
      "Инвестиционные пирамиды и хайпы",
      "Криптовалютные скамы",
      "Fake trading platforms и «гарантированная доходность»"
    ],
    recommendations: [
      "Правило: любая доходность выше 2% в месяц — красный флаг",
      "Никогда не инвестируйте под давлением «последнего шанса»",
      "Проверяйте лицензии через официальные реестры ЦБ"
    ],
    colorClass: "amber"
  },
  {
    id: "pragmatic",
    name: "Доверчивый рационалист",
    emoji: "🤔",
    description: "Вы стараетесь анализировать ситуацию, но уязвимы к давлению авторитетов, времени и собственной уверенности. Мошенники могут «дожать» вас через убедительную подачу и социальное доказательство.",
    strengths: [
      "Способность к анализу и сомнению",
      "Баланс между доверием и осторожностью",
      "Готовность искать второе мнение"
    ],
    vulnerabilities: [
      "Псевдоэкспертные курсы и коучинг",
      "Сложные финансовые продукты с мелким шрифтом",
      "Манипуляции через авторитет и «сложный язык»"
    ],
    recommendations: [
      "Если не понимаете продукт — не покупайте, пока не объяснят на пальцах",
      "Проверяйте «экспертов» в независимых источниках",
      "Установите личный лимит на спонтанные покупки"
    ],
    colorClass: "blue"
  },
  {
    id: "observer",
    name: "Метанаблюдатель",
    emoji: "🔍",
    description: "У вас развитые когнитивные фильтры и здоровый скептицизм. Однако главная опасность — ловушка «я неуязвим». Мошенники умеют работать и с теми, кто считает себя слишком умным для обмана.",
    strengths: [
      "Критическое мышление и анализ",
      "Устойчивость к эмоциональному давлению",
      "Умение распознавать манипулятивные паттерны"
    ],
    vulnerabilities: [
      "Сложные многоходовые схемы, рассчитанные на «умных»",
      "Ловушки подтверждения (confirmation bias)",
      "Переоценка собственной защищённости"
    ],
    recommendations: [
      "Помните: умные люди — любимая цель «элитных» мошенников",
      "Не отключайте осторожность, когда кто-то «говорит на вашем языке»",
      "Регулярно обновляйте знания о новых схемах"
    ],
    colorClass: "emerald"
  }
];

// Sample questions data (you'll need to replace this with actual questions)
const questions = [
  // Block A questions (personality profile)
  {
    id: "q1",
    block: "A",
    blockName: "Личностный профиль",
    category: "Новые знакомства и доверие",
    text: "Когда незнакомый человек начинает со мной активно общаться онлайн (чаты, соцсети, мессенджеры)…",
    options: [
      {
        letter: "A",
        text: "Проявляю интерес, мне приятно внимание, быстро раскрываюсь",
        traits: ["empath", "trust"]
      },
      {
        letter: "B",
        text: "Рассматриваю как потенциальную выгоду или возможность",
        traits: ["investor", "opportunity"]
      },
      {
        letter: "C",
        text: "Интересуюсь, но стараюсь всё проверить и проанализировать",
        traits: ["pragmatic", "analysis"]
      },
      {
        letter: "D",
        text: "Отношусь настороженно, сразу строю защитные барьеры",
        traits: ["observer", "skepticism"]
      }
    ]
  },
  // Add more questions here...
];

// ==========================================
// State
// ==========================================

let currentQuestionIndex = 0;
let answers = {};
let selectedOption = null;

// Block totals
const blockTotals = { A: 6, B: 4, C: 5 };

// ==========================================
// DOM Elements
// ==========================================

const testScreen = document.getElementById('test-screen');
const resultScreen = document.getElementById('result-screen');
const progressText = document.getElementById('progress-text');
const optionsContainer = document.getElementById('options');
const questionText = document.getElementById('question-text');
const blockBadge = document.getElementById('block-badge');
const categoryLabel = document.getElementById('category-label');

// Block elements
const blockElements = {
  A: document.getElementById('block-a'),
  B: document.getElementById('block-b'),
  C: document.getElementById('block-c')
};

const blockCounts = {
  A: document.getElementById('block-a-count'),
  B: document.getElementById('block-b-count'),
  C: document.getElementById('block-c-count')
};

const blockFills = {
  A: document.getElementById('block-a-fill'),
  B: document.getElementById('block-b-fill'),
  C: document.getElementById('block-c-fill')
};

// Result elements
const profileEmoji = document.getElementById('profile-emoji');
const profileName = document.getElementById('profile-name');
const profileDescription = document.getElementById('profile-description');
const strengthsList = document.getElementById('strengths-list');
const vulnerabilitiesList = document.getElementById('vulnerabilities-list');
const recommendationsList = document.getElementById('recommendations-list');
const summaryBlocks = document.getElementById('summary-blocks');

// Buttons
const backBtn = document.getElementById('back-btn');
const resetBtn = document.getElementById('reset-btn');
const backToTestsBtn = document.getElementById('back-to-tests-btn');

// ==========================================
// Functions
// ==========================================

function getBlockProgress() {
  const blocks = { A: 0, B: 0, C: 0 };
  
  Object.keys(answers).forEach(answerId => {
    const question = questions.find(q => q.id === answerId);
    if (question && answers[answerId]) {
      blocks[question.block]++;
    }
  });
  
  return blocks;
}

function updateBlockProgress() {
  const progress = getBlockProgress();
  const currentBlock = questions[currentQuestionIndex].block;
  
  // Update each block
  ['A', 'B', 'C'].forEach(block => {
    const total = blockTotals[block];
    const current = progress[block];
    blockCounts[block].textContent = `${current}/${total}`;
    blockFills[block].style.width = `${(current / total) * 100}%`;
    
    // Highlight active block
    if (block === currentBlock) {
      blockElements[block].classList.add('active');
    } else {
      blockElements[block].classList.remove('active');
    }
  });
}

function getBadgeClass(block) {
  const classes = {
    A: 'badge block-a-badge',
    B: 'badge block-b-badge',
    C: 'badge block-c-badge'
  };
  return classes[block];
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  
  // Update progress
  progressText.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
  updateBlockProgress();
  
  // Update question
  questionText.textContent = question.text;
  
  // Update badge
  blockBadge.textContent = question.blockName;
  blockBadge.className = getBadgeClass(question.block);
  
  // Update category
  categoryLabel.textContent = question.category;
  
  // Render options
  optionsContainer.innerHTML = '';
  
  question.options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.innerHTML = `
      <span class="option-letter">${option.letter}</span>
      <span class="option-text">${option.text}</span>
    `;
    
    button.addEventListener('click', () => handleAnswer(question.id, option.letter, option.traits));
    optionsContainer.appendChild(button);
  });
}

function handleAnswer(questionId, letter, traits) {
  if (selectedOption !== null) return;
  
  selectedOption = letter;
  
  // Update button states
  const buttons = optionsContainer.querySelectorAll('.option-btn');
  buttons.forEach((btn, index) => {
    const optionLetter = questions[currentQuestionIndex].options[index].letter;
    
    if (optionLetter === letter) {
      btn.classList.add('selected');
    } else {
      btn.classList.add('dimmed');
    }
    btn.disabled = true;
  });
  
  // Save answer and move to next
  setTimeout(() => {
    answers[questionId] = { letter, traits };
    
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      selectedOption = null;
      renderQuestion();
    } else {
      showResults();
    }
  }, 500);
}

function calculateProfile() {
  const traitCounts = {};
  
  Object.values(answers).forEach(answer => {
    answer.traits.forEach(trait => {
      traitCounts[trait] = (traitCounts[trait] || 0) + 1;
    });
  });
  
  // Calculate profile scores
  const empathScore = (traitCounts.empath || 0) + (traitCounts.trust || 0) * 0.5;
  const investorScore = (traitCounts.investor || 0) + (traitCounts.scarcity || 0) * 0.5 + (traitCounts.sunk_cost || 0) * 0.5;
  const pragmaticScore = (traitCounts.pragmatic || 0);
  const observerScore = (traitCounts.observer || 0);
  
  // Check for overconfidence modifier
  const overconfidenceModifier = (traitCounts.overconfident || 0) > 0 ? 0.8 : 1;
  
  const scores = [
    { id: "empath", score: empathScore },
    { id: "investor", score: investorScore },
    { id: "pragmatic", score: pragmaticScore * overconfidenceModifier },
    { id: "observer", score: observerScore * overconfidenceModifier }
  ];
  
  const maxScore = Math.max(...scores.map(s => s.score));
  const dominantProfileId = scores.find(s => s.score === maxScore)?.id || "pragmatic";
  
  return profiles.find(p => p.id === dominantProfileId) || profiles[2];
}

function showResults() {
  const profile = calculateProfile();
  
  // Update profile header
  profileEmoji.textContent = profile.emoji;
  profileName.textContent = profile.name;
  profileName.className = 'profile-name ' + profile.colorClass;
  profileDescription.textContent = profile.description;
  
  // Render strengths
  strengthsList.innerHTML = profile.strengths.map(strength => `
    <li class="strength-item">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      <span>${strength}</span>
    </li>
  `).join('');
  
  // Render vulnerabilities
  vulnerabilitiesList.innerHTML = profile.vulnerabilities.map(vuln => `
    <li class="vulnerability-item">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
      <span>${vuln}</span>
    </li>
  `).join('');
  
  // Render recommendations
  recommendationsList.innerHTML = profile.recommendations.map((rec, index) => `
    <li>
      <span class="recommendation-number">${index + 1}</span>
      <span>${rec}</span>
    </li>
  `).join('');
  
  // Render block summaries
  summaryBlocks.innerHTML = ['A', 'B', 'C'].map(block => {
    const blockQuestions = questions.filter(q => q.block === block);
    const blockAnswersArray = blockQuestions.filter(q => answers[q.id]);
    
    const answeredCount = blockAnswersArray.length;
    const totalCount = blockQuestions.length;
    
    // Calculate trait distribution for this block
    const traitCounts = {};
    blockAnswersArray.forEach(q => {
      const answer = answers[q.id];
      answer.traits.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      });
    });
    
    const blockClass = block === 'A' ? 'block-a' : block === 'B' ? 'block-b' : 'block-c';
    
    return `
      <div class="summary-block ${blockClass}">
        <div class="summary-block-header">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${block === 'A' ? '<circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' : 
              block === 'B' ? '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' : 
              '<path d="M9 18h6M10 22h4M12 2v1M12 6a4 4 0 0 0-4 4c0 2.5 2 4.5 4 6 2-1.5 4-3.5 4-6a4 4 0 0 0-4-4z"/>'}
          </svg>
          <span class="block-label">Блок ${block}</span>
        </div>
        <div class="summary-block-content">
          <div class="summary-counts">
            <div><span>Отвечено:</span> <span>${answeredCount}/${totalCount}</span></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Show result screen
  testScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
}

function resetTest() {
  currentQuestionIndex = 0;
  answers = {};
  selectedOption = null;
  
  testScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
  
  renderQuestion();
}

function initTest() {
  // Add event listeners
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'tests.html';
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTest);
  }
  
  if (backToTestsBtn) {
    backToTestsBtn.addEventListener('click', () => {
      window.location.href = 'tests.html';
    });
  }
  
  // Start the test
  renderQuestion();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTest);
} else {
  initTest();
}