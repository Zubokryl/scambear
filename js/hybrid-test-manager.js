/**
 * Hybrid Test Manager
 * Handles the standalone hybrid vulnerability test page
 */

class HybridTestManager {
    constructor(apiClient) {
        if (!apiClient) throw new Error('API client must be provided');
        this.api = apiClient;
        
        this.container = document.getElementById('hybridTestContainer');
        this.test = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        
        this.init();
    }
    
    async init() {
        try {
            // Load the hybrid test
            this.test = await this.api.getTestById('hybrid-vulnerability');
            if (!this.test) {
                this.container.innerHTML = '<p class="error">Тест не найден</p>';
                return;
            }
            
            // Initialize the test
            this.startTest();
        } catch (error) {
            console.error('Error initializing hybrid test:', error);
            this.container.innerHTML = '<p class="error">Ошибка загрузки теста</p>';
        }
    }
    
    startTest() {
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        
        // Set up global functions for the test
        this.setupGlobalFunctions();
        
        // Show the first question
        this.showQuestion();
    }
    
    setupGlobalFunctions() {
        // This function sets up the global functions that the renderQuestion and renderResult functions reference
        window.handleAnswer = (questionId, letter, traits) => {
            // Store the answer in the userAnswers object
            this.userAnswers[questionId] = {
                letter: letter,
                traits: traits
            };
            
            // Find the index of the question in the test
            const questionIndex = this.test.questions.findIndex(q => q.id === questionId);
            
            // Move to the next question
            this.currentQuestionIndex = questionIndex + 1;
            
            if (this.currentQuestionIndex < this.test.questions.length) {
                // Show next question
                this.showQuestion();
            } else {
                // Show results
                this.showResults();
            }
        };
        
        // Set up the resetTest function
        window.resetTest = () => {
            this.startTest();
        };
        
        // Set up the onBack function
        window.onBack = () => {
            // Redirect back to tests page
            window.location.href = 'tests.html';
        };
    }
    
    showQuestion() {
        if (!this.test || this.currentQuestionIndex >= this.test.questions.length) {
            this.showResults();
            return;
        }
        
        const currentQuestion = this.test.questions[this.currentQuestionIndex];
        const totalQuestions = this.test.questions.length;
        
        // Update progress text
        document.getElementById('progress-text').textContent = `${this.currentQuestionIndex + 1} / ${totalQuestions}`;
        
        // Update block progress
        this.updateBlockProgress();
        
        // Update question badges
        document.getElementById('block-badge').textContent = currentQuestion.blockName;
        document.getElementById('category-label').textContent = currentQuestion.category;
        
        // Update question text
        document.getElementById('question-text').textContent = currentQuestion.question;
        
        // Clear and populate options
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        
        currentQuestion.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-button';
            
            // Check if this option was selected
            const isSelected = this.userAnswers[currentQuestion.id] && this.userAnswers[currentQuestion.id].letter === option.letter;
            
            optionButton.className = `option-button ${isSelected ? "selected" : ""}`;
            
            // Add click handler to record answer
            optionButton.onclick = () => {
                if (window.handleAnswer) {
                    window.handleAnswer(currentQuestion.id, option.letter, option.traits);
                }
            };
            
            const optionContent = document.createElement('div');
            optionContent.className = 'option-content';
            
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter-circle';
            letterSpan.textContent = option.letter;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'option-text';
            textSpan.textContent = option.text;
            
            optionContent.appendChild(letterSpan);
            optionContent.appendChild(textSpan);
            
            optionButton.appendChild(optionContent);
            
            optionsContainer.appendChild(optionButton);
        });
    }
    
    updateBlockProgress() {
        // Calculate progress for each block
        const progress = this.test.getBlockProgress(this.userAnswers);
        
        // Update each block's progress
        for (const block of ['A', 'B', 'C']) {
            const blockElement = document.getElementById(`block-${block.toLowerCase()}`);
            if (blockElement) {
                // Update count
                document.getElementById(`block-${block.toLowerCase()}-count`).textContent = `${progress.blocks[block]}/${progress.totals[block]}`;
                
                // Update progress bar
                const progressFill = document.getElementById(`block-${block.toLowerCase()}-fill`);
                if (progressFill) {
                    const percentage = progress.totals[block] > 0 ? (progress.blocks[block] / progress.totals[block]) * 100 : 0;
                    progressFill.style.width = `${percentage}%`;
                }
                
                // Highlight active block
                const isCurrentBlock = this.test.questions[this.currentQuestionIndex]?.block === block;
                if (isCurrentBlock) {
                    blockElement.classList.add('active');
                } else {
                    blockElement.classList.remove('active');
                }
            }
        }
    }
    
    showResults() {
        // Hide test screen and show result screen
        document.getElementById('test-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        
        // Convert user answers to the format expected by the hybrid test
        // Calculate profile using the test's own function
        const profile = this.test.calculateProfile(this.userAnswers);
        
        // Update profile header
        document.getElementById('profile-emoji').textContent = profile.emoji;
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-description').textContent = profile.description;
        
        // Update strengths list
        const strengthsList = document.getElementById('strengths-list');
        strengthsList.innerHTML = '';
        profile.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
        
        // Update vulnerabilities list
        const vulnerabilitiesList = document.getElementById('vulnerabilities-list');
        vulnerabilitiesList.innerHTML = '';
        profile.vulnerabilities.forEach(vulnerability => {
            const li = document.createElement('li');
            li.textContent = vulnerability;
            vulnerabilitiesList.appendChild(li);
        });
        
        // Update recommendations list
        const recommendationsList = document.getElementById('recommendations-list');
        recommendationsList.innerHTML = '';
        profile.recommendations.forEach((rec, i) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="recommendation-number">${i + 1}</span> ${rec}`;
            recommendationsList.appendChild(li);
        });
        
        // Update answer summary by blocks
        const summaryBlocks = document.getElementById('summary-blocks');
        summaryBlocks.innerHTML = '<div class="summary-grid">'; // Assuming we want a grid layout
        
        ['A', 'B', 'C'].forEach(block => {
            const blockAnswers = Object.entries(this.userAnswers)
                .filter(([id]) => this.test.questions.find(q => q.id === id)?.block === block);
            
            const aCount = blockAnswers.filter(([, a]) => a.letter === "A").length;
            const bCount = blockAnswers.filter(([, a]) => a.letter === "B").length;
            const cCount = blockAnswers.filter(([, a]) => a.letter === "C").length;
            
            const blockDiv = document.createElement('div');
            blockDiv.className = 'answer-summary-card';
            
            blockDiv.innerHTML = `
                <div class="block-header">
                    <div class="block-info">
                        <span class="block-label">Блок ${block}</span>
                    </div>
                </div>
                <div class="answer-summary-counts">
                    <div class="flex justify-between"><span>Ответов A:</span><span class="count-a">${aCount}</span></div>
                    <div class="flex justify-between"><span>Ответов B:</span><span class="count-b">${bCount}</span></div>
                    <div class="flex justify-between"><span>Ответов C:</span><span class="count-c">${cCount}</span></div>
                </div>
            `;
            
            summaryBlocks.appendChild(blockDiv);
        });
        
        summaryBlocks.innerHTML += '</div>';
        
        // Set up event listeners for the action buttons
        document.getElementById('reset-btn').onclick = () => {
            this.startTest();
            // Show test screen again
            document.getElementById('test-screen').classList.remove('hidden');
            document.getElementById('result-screen').classList.add('hidden');
        };
    }
}

// Initialize HybridTestManager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize API client
    const api = window.api || createFallbackApi();
    
    // Initialize HybridTestManager
    window.hybridTestManager = new HybridTestManager(api);
});

function createFallbackApi() {
    return {
        async getTestById(id) {
            try {
                if (window.api && typeof window.api.getTestById === 'function') {
                    return await window.api.getTestById(id);
                } else {
                    // Fallback: return null
                    return null;
                }
            } catch (error) {
                console.error('Error fetching test:', error);
                return null;
            }
        }
    };
}