/**
 * Tests Manager
 * Handles rendering and managing psychology tests
 */

class TestsManager {
    constructor(apiClient) {
        if (!apiClient) throw new Error('API client must be provided');
        this.api = apiClient;
        
        this.testsGrid = document.getElementById('testsGrid');
        this.testModal = document.getElementById('testModal');
        this.testModalBody = document.getElementById('testBody');
        this.closeTestModalBtn = document.getElementById('closeTestModal');
        this.testModalTitle = document.getElementById('testModalTitle');
        
        this.adminTestModal = document.getElementById('adminTestModal');
        this.adminTestModalTitle = document.getElementById('adminTestModalTitle');
        this.testForm = document.getElementById('testForm');
        this.closeAdminTestModalBtn = document.getElementById('closeAdminTestModal');
        this.cancelTestBtn = document.getElementById('cancelTestBtn');
        
        this.currentTest = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        
        this.init();
    }
    
    init() {
        // Close Test Modal
        if (this.closeTestModalBtn) {
            this.closeTestModalBtn.addEventListener('click', () => {
                this.testModal.classList.remove('active');
            });
        }
        
        // Close Admin Test Modal
        if (this.closeAdminTestModalBtn) {
            this.closeAdminTestModalBtn.addEventListener('click', () => {
                this.adminTestModal.classList.remove('active');
            });
        }
        
        // Cancel button for admin form
        if (this.cancelTestBtn) {
            this.cancelTestBtn.addEventListener('click', () => {
                this.adminTestModal.classList.remove('active');
            });
        }
        
        // Close on outside click
        if (this.testModal) {
            this.testModal.addEventListener('click', (e) => {
                if (e.target === this.testModal) {
                    this.testModal.classList.remove('active');
                }
            });
        }
        
        if (this.adminTestModal) {
            this.adminTestModal.addEventListener('click', (e) => {
                if (e.target === this.adminTestModal) {
                    this.adminTestModal.classList.remove('active');
                }
            });
        }
        
        // Test form submission
        if (this.testForm) {
            this.testForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTest();
            });
        }
        
        // Load tests
        this.loadTests();
    }
    
    async loadTests() {
        if (!this.testsGrid) return;
        
        this.testsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Загрузка тестов...</p></div>';
        
        try {
            const tests = await this.api.getTests();
            this.renderTests(tests);
        } catch (err) {
            console.error(err);
            this.testsGrid.innerHTML = '<p class="error">Ошибка загрузки тестов</p>';
        }
    }
    
    renderTests(tests) {
        if (!this.testsGrid) return;
        
        if (tests.length === 0) {
            this.testsGrid.innerHTML = '<p class="empty-state">Тесты не найдены<br>Попробуйте изменить параметры поиска или зайти позже.</p>';
            return;
        }
        
        const testsHtml = tests.map(test => {
            // Determine difficulty badge
            let difficultyBadge = 'difficulty-basic';
            if (test.difficulty === 'medium' || (test.questions && test.questions.length > 10)) {
                difficultyBadge = 'difficulty-medium';
            } else if (test.difficulty === 'advanced' || (test.questions && test.questions.length > 15)) {
                difficultyBadge = 'difficulty-advanced';
            }
                    
            // Determine gradient class based on test category
            let gradientClass = 'gradient-orange';
            if (test.id.includes('authority') || test.id === 'hybrid-vulnerability') {
                gradientClass = 'gradient-blue';
            } else if (test.id.includes('emotion') || test.id.includes('empath')) {
                gradientClass = 'gradient-pink';
            } else if (test.id.includes('social')) {
                gradientClass = 'gradient-green';
            } else if (test.id.includes('nlp') || test.id.includes('cognitive')) {
                gradientClass = 'gradient-purple';
            }
                    
            // Determine icon based on test category
            let iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
            if (test.id.includes('authority')) {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
            } else if (test.id.includes('emotion') || test.id.includes('empath')) {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            } else if (test.id.includes('social')) {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
            } else if (test.id.includes('nlp') || test.id.includes('cognitive')) {
                iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
            }
                    
            // Build HTML with string concatenation to avoid template literal issues
            let cardHtml = '<button class="test-card" onclick="window.testsManager.startTest(\'' + test.id + '\')">';
            cardHtml += '<div class="test-card-gradient ' + gradientClass + '"></div>';
            cardHtml += '<div class="test-card-content">';
            cardHtml += '<div class="test-card-header">';
            cardHtml += '<div class="test-card-icon">';
            cardHtml += iconSvg;
            cardHtml += '</div>';
            cardHtml += '<span class="difficulty-badge ' + difficultyBadge + '">' + (test.difficulty || 'Базовый') + '</span>';
            cardHtml += '</div>';
            cardHtml += '<h3 class="test-card-title">' + test.title + '</h3>';
            cardHtml += '<p class="test-card-description">' + test.description + '</p>';
            cardHtml += '<div class="test-card-meta">';
            cardHtml += '<span class="meta-item">';
            cardHtml += '<svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
            cardHtml += '<circle cx="12" cy="12" r="10"/>';
            cardHtml += '<polyline points="12 6 12 12 16 14"/>';
            cardHtml += '</svg>';
            cardHtml += test.duration || '5-10 мин';
            cardHtml += '</span>';
            cardHtml += '<span class="meta-item">';
            cardHtml += '<svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
            cardHtml += '<circle cx="12" cy="12" r="10"/>';
            cardHtml += '<circle cx="12" cy="12" r="3"/>';
            cardHtml += '</svg>';
            cardHtml += (test.questionsCount || (test.questions && test.questions.length) || '8') + ' вопросов';
            cardHtml += '</span>';
            cardHtml += '<span class="meta-item chevron">';
            cardHtml += '<svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
            cardHtml += '<polyline points="9 18 15 12 9 6"/>';
            cardHtml += '</svg>';
            cardHtml += '</span>';
            cardHtml += '</div>';
            cardHtml += '</div>';
            cardHtml += '</button>';
            
            return cardHtml;
        }).join('');
        
        this.testsGrid.innerHTML = testsHtml;
        
        // Add admin controls
        this.addAdminControls();
    }
    
    renderAdminTestControls(test) {
        return '<div class="admin-controls" style="position: absolute; top: 10px; right: 10px; z-index: 1000; display: none;">' +
               '<button class="btn-icon" data-action="edit" data-test-id="' + test.id + '" title="Редактировать">' +
                   '<i class="fas fa-edit"></i>' +
               '</button>' +
               '<button class="btn-icon delete" data-action="delete" data-test-id="' + test.id + '" title="Удалить">' +
                   '<i class="fas fa-trash"></i>' +
               '</button>' +
               '</div>';
    }
    
    addTestStartListeners() {
        const startButtons = document.querySelectorAll('.test-start-btn');
        startButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const testId = e.target.closest('.test-start-btn').getAttribute('data-test-id');
                this.startTest(testId);
            });
        });
    }
    
    async startTest(testId) {
        try {
            const test = await this.api.getTestById(testId);
            if (!test) {
                alert('Тест не найден');
                return;
            }
            
            this.currentTest = test;
            this.currentQuestionIndex = 0;
            this.userAnswers = [];
            
            this.showTestModal(test);
        } catch (error) {
            console.error('Error starting test:', error);
            alert('Ошибка загрузки теста');
        }
    }
    
    showTestModal(test) {
        this.testModalTitle.textContent = test.title;
        
        // For hybrid test, redirect to separate page instead of modal
        if (test.id === 'hybrid-vulnerability') {
            window.location.href = 'hybrid-test-full.html';
            return;
        }
        
        // Set up global functions for other tests if needed
        if (test.id !== 'hybrid-vulnerability') {
            this.setupGlobalFunctions(test);
        }
        
        const testContent = this.generateTestContent(test);
        this.testModalBody.innerHTML = testContent;
        
        this.testModal.classList.add('active');
        
        // Add event listeners for test navigation
        this.addTestNavigationListeners();
    }
    
    generateTestContent(test) {
        // Check if this is the hybrid-vulnerability test and it has the new rendering functions
        if (test.id === 'hybrid-vulnerability' && typeof test.renderQuestion === 'function') {
            // Set up the global functions before rendering
            this.setupGlobalFunctions(test);
            
            // Use the new renderQuestion function for hybrid test
            // For hybrid test, userAnswers is already in the correct format
            const container = test.renderQuestion(
                test.questions[this.currentQuestionIndex],
                this.currentQuestionIndex,
                test.questions.length,
                this.userAnswers,
                test.blockColors,
                () => this.testModal.classList.remove('active')
            );
            
            return container.outerHTML;
        }
        
        // For other tests, use the original implementation
        if (!this.currentTest || this.currentTest.questions.length <= this.currentQuestionIndex) {
            return this.generateTestResults();
        }
        
        const question = this.currentTest.questions[this.currentQuestionIndex];
        const questionNumber = this.currentQuestionIndex + 1;
        const totalQuestions = this.currentTest.questions.length;
        
        let optionsHtml = '';
        if (question.options && Array.isArray(question.options)) {
            optionsHtml = question.options.map((option, idx) => {
                let optionHtml = '<div class="test-option">';
                optionHtml += '<label class="test-option-label">';
                optionHtml += '<input type="radio" name="question-' + this.currentQuestionIndex + '" value="' + idx + '" class="test-option-input">';
                optionHtml += '<span class="test-option-text">' + option.text + '</span>';
                optionHtml += '</label>';
                optionHtml += '</div>';
                return optionHtml;
            }).join('');
        }
        
        // Update optionsHtml to use new format with buttons
        if (question.options && Array.isArray(question.options)) {
            optionsHtml = question.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D...
                let buttonHtml = '<button class="option-button" data-option-index="' + idx + '">';
                buttonHtml += '<span class="option-letter">' + letter + '</span>';
                buttonHtml += '<span class="option-text">' + option.text + '</span>';
                buttonHtml += '</button>';
                return buttonHtml;
            }).join('');
        }
        
        // Prepare conditional values outside template literal to avoid parsing issues
        const disabledAttr = this.currentQuestionIndex === 0 ? 'disabled' : '';
        const buttonText = this.currentQuestionIndex === totalQuestions - 1 ? 'Завершить тест' : 'Следующий вопрос';
        
        // Build HTML string using concatenation to avoid complex template literal issues
        let html = '<div class="test-container">';
        html += '<!-- Прогресс -->';
        html += '<div class="test-progress">';
        html += '<div class="progress-bar">';
        html += '<div class="progress-fill" style="width: ' + (questionNumber / totalQuestions * 100) + '%"></div>';
        html += '</div>';
        html += '<span class="progress-text">Вопрос ' + questionNumber + ' из ' + totalQuestions + '</span>';
        html += '</div>';
        
        html += '<!-- Карточка вопроса -->';
        html += '<div class="question-card">';
        html += '<h3 class="question-text">';
        html += question.question;
        html += '</h3>';
        
        html += '<!-- Варианты ответов -->';
        html += '<div class="options-list">';
        html += optionsHtml;
        html += '</div>';
        
        html += '<!-- Feedback (появляется после выбора) -->';
        html += '<div class="feedback-box" id="feedback-box">';
        html += '<div class="feedback-icon">';
        html += '<!-- Иконка галочки -->';
        html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        html += '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>';
        html += '<polyline points="22 4 12 14.01 9 11.01"/>';
        html += '</svg>';
        html += '</div>';
        html += '<p class="feedback-text" id="feedback-text"></p>';
        html += '</div>';
        
        html += '<!-- Кнопки навигации -->';
        html += '<div class="navigation-buttons">';
        html += '<button class="prev-button" id="prev-question" ' + disabledAttr + '>';  
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        html += '<path d="M19 12H5M12 19l-7-7 7-7"/>';
        html += '</svg>Назад</button>';
        
        html += '<button class="next-button" id="next-question">';
        html += buttonText;
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
        html += '<path d="M5 12h14M12 5l7 7-7 7"/>';
        html += '</svg></button>';
        html += '</div>';
        
        html += '</div></div>';
        
        return html;
    }
    
    setupGlobalFunctions(test) {
        // This function sets up the global functions that the renderQuestion and renderResult functions reference
        window.handleAnswer = (questionId, letter, traits) => {
            // Store the answer in the userAnswers object
            this.userAnswers[questionId] = {
                letter: letter,
                traits: traits
            };
            
            // Move to the next question
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex < test.questions.length) {
                // Show next question
                const testContent = this.generateTestContent(test);
                this.testModalBody.innerHTML = testContent;
                this.addTestNavigationListeners();
            } else {
                // Show results
                const testContent = this.generateTestResults(test);
                this.testModalBody.innerHTML = testContent;
                this.addTestNavigationListeners();
            }
        };
        
        // Set up the resetTest function
        window.resetTest = () => {
            this.currentQuestionIndex = 0;
            this.userAnswers = {};
            this.showTestModal(test);
        };
        
        // Set up the onBack function
        window.onBack = () => {
            if (test.id === 'hybrid-vulnerability') {
                // For hybrid test, redirect to tests page
                window.location.href = 'tests.html';
            } else {
                this.testModal.classList.remove('active');
            }
        };
    }
    
    handleAnswerSelection(container, questionId, test) {
        // This function is kept for potential future use
    }
    
    convertAnswersToNewFormat(userAnswers, test) {
        // Convert the userAnswers array to the new format expected by render functions
        const answers = {};
        
        for (let i = 0; i < userAnswers.length; i++) {
            if (userAnswers[i] !== undefined) {
                const question = test.questions[i];
                if (question && question.options && question.options[userAnswers[i]]) {
                    const option = question.options[userAnswers[i]];
                    answers[question.id] = {
                        letter: option.letter || String.fromCharCode(65 + userAnswers[i]), // A, B, C, etc.
                        traits: option.traits || []
                    };
                }
            }
        }
        
        return answers;
    }
    
    generateTestResults(test) {
        const testToUse = test || this.currentTest;
        
        // Check if this is the hybrid-vulnerability test and it has the new rendering functions
        if (testToUse.id === 'hybrid-vulnerability' && typeof testToUse.calculateProfile === 'function' && typeof testToUse.renderResult === 'function') {
            // Set up the global functions before rendering
            this.setupGlobalFunctions(testToUse);
            
            // For hybrid test, userAnswers is already in the correct format
            // Calculate profile using the test's own function
            const profile = testToUse.calculateProfile(this.userAnswers);
            
            // Use the new renderResult function for hybrid test
            const container = testToUse.renderResult(profile, this.userAnswers, testToUse.questions);
            
            return container.outerHTML;
        }
        
        // For other tests, use the original implementation
        let score = 0;
        let feedback = '';
        
        for (let i = 0; i < testToUse.questions.length; i++) {
            const question = testToUse.questions[i];
            const userAnswerIndex = this.userAnswers[i];
            if (userAnswerIndex !== undefined && question.options[userAnswerIndex]) {
                score += question.options[userAnswerIndex].score || 0;
            }
        }
        
        // Generate feedback based on score
        const maxScore = testToUse.questions.reduce((sum, q) => {
            const maxOptionScore = Math.max(...q.options.map(opt => opt.score || 0));
            return sum + maxOptionScore;
        }, 0);
        
        const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
        
        if (percentage >= 80) {
            feedback = 'Отличный результат! Вы хорошо защищены от манипуляций.';
        } else if (percentage >= 60) {
            feedback = 'Хорошо, но есть над чем поработать.';
        } else if (percentage >= 40) {
            feedback = 'У вас есть уязвимости, которые стоит укрепить.';
        } else {
            feedback = 'Вам стоит пройти больше обучения по защите от манипуляций.';
        }
        
        // Set up the global functions for non-hybrid tests too to ensure restart works
        this.setupGlobalFunctions(testToUse);
        
        // Build HTML string using concatenation to avoid template literal issues
        let html = '<div class="test-results">';
        html += '<h3>Результаты теста</h3>';
        html += '<div class="test-score">';
        html += '<div class="test-score-value">' + Math.round(percentage) + '%</div>';
        html += '<div class="test-score-text">Ваш результат</div>';
        html += '</div>';
        html += '<p class="test-feedback">' + feedback + '</p>';
        html += '<div class="test-results-details">';
        html += '<p>Вы набрали ' + score + ' баллов из ' + maxScore + ' возможных.</p>';
        html += '</div>';
        html += '<button id="restartTest" class="btn btn-primary">';
        html += '<i class="fas fa-redo"></i> Пройти снова';
        html += '</button>';
        html += '</div>';
        
        return html;
    }
    
    addTestNavigationListeners() {
        // For hybrid tests, use the original implementation
        if (this.currentTest && this.currentTest.id === 'hybrid-vulnerability') {
            // Next question button
            const nextBtn = document.getElementById('nextQuestion');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.handleNextQuestion();
                });
            }
            
            // Previous question button
            const prevBtn = document.getElementById('prevQuestion');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    this.handlePreviousQuestion();
                });
            }
            
            // Restart test button
            const restartBtn = document.getElementById('restartTest');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    this.currentQuestionIndex = 0;
                    this.userAnswers = [];
                    this.showTestModal(this.currentTest);
                });
            }
        } else {
            // For regular tests with feedback
            this.addRegularTestListeners();
        }
    }
        
    addRegularTestListeners() {
        // Option buttons
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Remove selected class from all options
                optionButtons.forEach(btn => btn.classList.remove('selected'));
                    
                // Add selected class to clicked option
                button.classList.add('selected');
                    
                // Get the selected option index
                const optionIndex = parseInt(button.dataset.optionIndex);
                    
                // Get current question
                const question = this.currentTest.questions[this.currentQuestionIndex];
                    
                // Get the selected option
                const selectedOption = question.options[optionIndex];
                    
                // Store the answer
                this.userAnswers[this.currentQuestionIndex] = optionIndex;
                    
                // Show feedback
                this.showFeedback(selectedOption);
            });
        });
        
        // Next button
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentQuestionIndex++;
                    
                if (this.currentQuestionIndex < this.currentTest.questions.length) {
                    // Show next question
                    const testContent = this.generateTestContent(this.currentTest);
                    this.testModalBody.innerHTML = testContent;
                    this.addTestNavigationListeners();
                } else {
                    // Show results
                    const testContent = this.generateTestResults(this.currentTest);
                    this.testModalBody.innerHTML = testContent;
                    this.addTestNavigationListeners();
                }
            });
        }
            
        // Previous button
        const prevBtn = document.getElementById('prev-question');
        if (prevBtn && !prevBtn.hasAttribute('disabled')) {
            prevBtn.addEventListener('click', () => {
                if (this.currentQuestionIndex > 0) {
                    this.currentQuestionIndex--;
                    const testContent = this.generateTestContent(this.currentTest);
                    this.testModalBody.innerHTML = testContent;
                    this.addTestNavigationListeners();
                }
            });
        }
    }
        
    showFeedback(option) {
        const feedbackBox = document.getElementById('feedback-box');
        const feedbackText = document.getElementById('feedback-text');
            
        if (feedbackBox && feedbackText && option.feedback) {
            feedbackText.textContent = option.feedback;
                
            // Determine feedback type based on score
            feedbackBox.classList.remove('positive', 'negative', 'neutral');
                
            if (option.score >= 2) {
                feedbackBox.classList.add('positive');
            } else if (option.score <= 1) {
                feedbackBox.classList.add('negative');
            } else {
                feedbackBox.classList.add('neutral');
            }
                
            feedbackBox.classList.add('show');
                
            // Show next button
            const nextBtn = document.getElementById('next-question');
            if (nextBtn) {
                nextBtn.classList.add('show');
            }
        }
    }
        
    handleNextQuestion() {
        // For hybrid tests, use the original implementation
        if (this.currentTest && this.currentTest.id === 'hybrid-vulnerability') {
            // Get selected answer
            const selectedOption = document.querySelector(`input[name="question-${this.currentQuestionIndex}"]:checked`);
            if (selectedOption) {
                this.userAnswers[this.currentQuestionIndex] = parseInt(selectedOption.value);
            } else {
                // If no answer selected, record as undefined
                this.userAnswers[this.currentQuestionIndex] = undefined;
            }
            
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex < this.currentTest.questions.length) {
                // Show next question
                const testContent = this.generateTestContent(this.currentTest);
                this.testModalBody.innerHTML = testContent;
                this.addTestNavigationListeners();
            } else {
                // Show results
                const testContent = this.generateTestContent(this.currentTest);
                this.testModalBody.innerHTML = testContent;
                this.addTestNavigationListeners();
            }
        } else {
            // For regular tests with feedback, next button is handled in addRegularTestListeners
            // This function should not be called for regular tests with feedback
            console.warn('handleNextQuestion should not be called for regular tests with feedback');
        }
    }
    
    handlePreviousQuestion() {
        // For hybrid tests, use the original implementation
        if (this.currentTest && this.currentTest.id === 'hybrid-vulnerability') {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                const testContent = this.generateTestContent(this.currentTest);
                this.testModalBody.innerHTML = testContent;
                this.addTestNavigationListeners();
            }
        } else {
            // For regular tests with feedback, previous navigation should be implemented separately if needed
            console.warn('handlePreviousQuestion should not be called for regular tests with feedback');
        }
    }
    
    async addAdminControls() {
        // Admin controls are not shown since tests are hardcoded
        // Check if user is an admin
        try {
            const isAdmin = await this.api.isAdminAuthenticated();
            if (isAdmin) {
                // Show admin controls
                const adminControls = document.querySelectorAll('.admin-controls');
                adminControls.forEach(control => {
                    // For now, hide admin controls since tests are hardcoded
                    control.style.display = 'none';
                });
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }
    

}

// TestsManager is initialized in main.js when needed

function createFallbackApi() {
    return {
        async getTests() {
            try {
                // Return the mock tests directly if no API is available
                if (window.testsApi && typeof window.testsApi.getTests === 'function') {
                    return await window.testsApi.getTests();
                } else {
                    // Fallback: return empty array
                    return [];
                }
            } catch (error) {
                console.error('Error fetching tests:', error);
                return [];
            }
        },
        async getTestById(id) {
            try {
                // Return the mock test directly if no API is available
                if (window.testsApi && typeof window.testsApi.getTestById === 'function') {
                    return await window.testsApi.getTestById(id);
                } else {
                    // Fallback: return null
                    return null;
                }
            } catch (error) {
                console.error('Error fetching test:', error);
                return null;
            }
        },
        async createTest(testData) {
            try {
                // Fallback: simulate success
                const newTestData = {};
                Object.assign(newTestData, testData);
                newTestData.id = testData.id || Date.now().toString();
                return newTestData;
            } catch (error) {
                console.error('Error creating test:', error);
                throw error;
            }
        },
        async updateTest(testData) {
            try {
                // Fallback: simulate success
                return testData;
            } catch (error) {
                console.error('Error updating test:', error);
                throw error;
            }
        },
        async deleteTest(id) {
            try {
                // Fallback: simulate success
                return true;
            } catch (error) {
                console.error('Error deleting test:', error);
                throw error;
            }
        },
        async isAdminAuthenticated() {
            try {
                // Fallback: return false
                return false;
            } catch (error) {
                console.error('Error checking admin status:', error);
                return false;
            }
        }
    };
}