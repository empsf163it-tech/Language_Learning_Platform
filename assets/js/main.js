/* ==========================================================================
   WeTalksy - Main Application Logic, ScrollSpy, Speech & Ongoing Action State
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       0. PAGE INITIALIZATION (HOME BY DEFAULT UNLESS ONGOING ACTION IN SECTION)
       ---------------------------------------------------------------------- */
    const ongoingSection = sessionStorage.getItem('wetalksy_ongoing_section') || 
                           (window.location.hash ? window.location.hash.substring(1) : null);

    if (ongoingSection && document.getElementById(ongoingSection) && ongoingSection !== 'home') {
        const targetEl = document.getElementById(ongoingSection);
        setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }

    // Register ongoing action helper
    window.registerOngoingAction = function(sectionId) {
        if (sectionId) {
            sessionStorage.setItem('wetalksy_ongoing_section', sectionId);
        }
    };

    /* ----------------------------------------------------------------------
       1. HEADER SCROLL & MOBILE MENU TOGGLE
       ---------------------------------------------------------------------- */
    const header = document.getElementById('header');
    const btnBackToTop = document.getElementById('btnBackToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (btnBackToTop) {
            if (window.scrollY > 400) {
                btnBackToTop.classList.add('show');
            } else {
                btnBackToTop.classList.remove('show');
            }
        }
    });

    if (btnBackToTop) {
        btnBackToTop.addEventListener('click', () => {
            sessionStorage.removeItem('wetalksy_ongoing_section');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const btnMobileToggle = document.getElementById('btnMobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (btnMobileToggle && navMenu) {
        btnMobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu on clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && e.target !== btnMobileToggle) {
                navMenu.classList.remove('active');
            }
        });
    }

    /* ----------------------------------------------------------------------
       2. PRECISE SCROLLSPY (ACTIVE STATE SWITCHES ONLY WHEN REACHING NEXT MENU)
       ---------------------------------------------------------------------- */
    const navLinks = document.querySelectorAll('.nav-link');
    const mainSectionIds = ['home', 'learn', 'practice', 'talk', 'progress', 'contact'];

    function updateActiveNav() {
        const headerOffset = 100;
        const scrollPosition = window.scrollY + headerOffset;
        let currentActiveId = 'home';

        mainSectionIds.forEach(id => {
            const sectionEl = document.getElementById(id);
            if (sectionEl) {
                const sectionTop = sectionEl.offsetTop;
                if (scrollPosition >= sectionTop) {
                    currentActiveId = id;
                }
            }
        });

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 80) {
            currentActiveId = 'contact';
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentActiveId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('resize', updateActiveNav);
    updateActiveNav();

    // Manage ongoing action state on navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (navMenu) navMenu.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#home') {
                e.preventDefault();
                sessionStorage.removeItem('wetalksy_ongoing_section');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                history.pushState(null, null, '#home');
            } else if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                if (mainSectionIds.includes(targetId)) {
                    sessionStorage.setItem('wetalksy_ongoing_section', targetId);
                }
            }
        });
    });

    /* ----------------------------------------------------------------------
       3. MODAL CONTROLS & PASSWORD VISIBILITY TOGGLES
       ---------------------------------------------------------------------- */
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    const btnSignIn = document.getElementById('btnSignIn');
    const btnSignInMobile = document.getElementById('btnSignInMobile');
    const btnStartHeader = document.getElementById('btnStartHeader');
    const btnStartMobile = document.getElementById('btnStartMobile');
    const btnStartHero = document.getElementById('btnStartHero');
    
    const btnCloseLoginModal = document.getElementById('btnCloseLoginModal');
    const btnCloseSignupModal = document.getElementById('btnCloseSignupModal');

    const linkOpenSignup = document.getElementById('linkOpenSignup');
    const linkOpenLogin = document.getElementById('linkOpenLogin');

    function openLoginModal() {
        if (signupModal) signupModal.classList.remove('active');
        if (loginModal) loginModal.classList.add('active');
        if (navMenu) navMenu.classList.remove('active');
    }

    function openSignupModal() {
        if (loginModal) loginModal.classList.remove('active');
        if (signupModal) signupModal.classList.add('active');
        if (navMenu) navMenu.classList.remove('active');
    }

    function closeModals() {
        if (loginModal) loginModal.classList.remove('active');
        if (signupModal) signupModal.classList.remove('active');
    }

    if (btnSignIn) btnSignIn.addEventListener('click', openLoginModal);
    if (btnSignInMobile) btnSignInMobile.addEventListener('click', openLoginModal);
    if (btnStartHeader) btnStartHeader.addEventListener('click', openSignupModal);
    if (btnStartMobile) btnStartMobile.addEventListener('click', openSignupModal);
    if (btnStartHero) btnStartHero.addEventListener('click', openSignupModal);

    if (btnCloseLoginModal) btnCloseLoginModal.addEventListener('click', closeModals);
    if (btnCloseSignupModal) btnCloseSignupModal.addEventListener('click', closeModals);

    if (linkOpenSignup) {
        linkOpenSignup.addEventListener('click', (e) => {
            e.preventDefault();
            openSignupModal();
        });
    }

    if (linkOpenLogin) {
        linkOpenLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });
    }

    [loginModal, signupModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModals();
            });
        }
    });

    // Password Visibility Toggle Listener
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                const eyeSpan = btn.querySelector('.eye-icon');
                if (eyeSpan) {
                    eyeSpan.textContent = isPassword ? '🙈' : '👁️';
                }
            }
        });
    });

    // Signup Form Confirm Password Validation
    const signupForm = document.getElementById('signupForm');
    const signupPasswordInput = document.getElementById('signupPasswordInput');
    const signupConfirmPasswordInput = document.getElementById('signupConfirmPasswordInput');
    const signupPasswordError = document.getElementById('signupPasswordError');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (signupPasswordInput && signupConfirmPasswordInput) {
                if (signupPasswordInput.value !== signupConfirmPasswordInput.value) {
                    if (signupPasswordError) signupPasswordError.style.display = 'block';
                    signupConfirmPasswordInput.focus();
                    return false;
                } else {
                    if (signupPasswordError) signupPasswordError.style.display = 'none';
                }
            }
            alert('Account created successfully! Welcome to WeTalksy.');
            if (signupModal) signupModal.classList.remove('active');
            signupForm.reset();
        });

        if (signupConfirmPasswordInput) {
            signupConfirmPasswordInput.addEventListener('input', () => {
                if (signupPasswordError && signupPasswordInput) {
                    if (signupPasswordInput.value === signupConfirmPasswordInput.value) {
                        signupPasswordError.style.display = 'none';
                    }
                }
            });
        }
    }

    /* ----------------------------------------------------------------------
       4. LANGUAGE SELECTION DATA & DYNAMIC ENGINE
       ---------------------------------------------------------------------- */
    const languageData = {
        es: {
            name: "Spanish",
            code: "es-ES",
            heroWord: "¡Hola! ¿Cómo estás?",
            heroPhonetic: "/ˈo.la ˈko.mo esˈtas/",
            heroTranslation: "Hello! How are you?",
            avatar: "Mateo (Madrid, Spain)",
            cards: [
                { word: "Me gustaría un café", phonetic: "/me ɡus.taˈɾi.a un kaˈfe/", meaning: "I would like a coffee" },
                { word: "¿Dónde está la estación?", phonetic: "/ˈdon.de esˈta la es.taˈθjon/", meaning: "Where is the station?" },
                { word: "Mucho gusto en conocerte", phonetic: "/ˈmu.tʃo ˈɡus.to en ko.noˈθeɾ.te/", meaning: "Nice to meet you" },
                { word: "¿Cuánto cuesta esto?", phonetic: "/ˈkwan.to ˈkwes.ta ˈes.to/", meaning: "How much does this cost?" },
                { word: "¡Qué tengas un buen día!", phonetic: "/ke ˈten.ɡas un bwen ˈdi.a/", meaning: "Have a great day!" }
            ],
            chatInit: [
                { bot: "¡Hola! bienvenido al café. ¿Qué te gustaría pedir hoy?", botTrans: "Hello! Welcome to the cafe. What would you like to order today?" },
                { user: "Hola Mateo, me gustaría un café con leche y un croissant, por favor.", userTrans: "Hello Mateo, I would like a coffee with milk and a croissant, please." }
            ],
            chatSuggestions: [
                "☕ Caliente, por favor. (Hot, please.)",
                "🧊 Con hielo, ¡hace mucho calor! (With ice!)",
                "🥛 ¿Tienes leche de avena? (Oat milk?)"
            ]
        },
        fr: {
            name: "French",
            code: "fr-FR",
            heroWord: "Bonjour! Comment allez-vous?",
            heroPhonetic: "/bɔ̃.ʒuʁ kɔ.mɑ̃ t-a.le vu/",
            heroTranslation: "Hello! How are you?",
            avatar: "Camille (Paris, France)",
            cards: [
                { word: "Je voudrais un café", phonetic: "/ʒə vu.dʁɛ ɛ̃ ka.fe/", meaning: "I would like a coffee" },
                { word: "Où se trouve la gare?", phonetic: "/u sə tʁuv la ɡaʁ/", meaning: "Where is the train station?" },
                { word: "Enchanté de vous rencontrer", phonetic: "/ɑ̃.ʃɑ̃.te də vu ʁɑ̃.kɔ̃.tʁe/", meaning: "Pleased to meet you" }
            ],
            chatInit: [
                { bot: "Bonjour! Bienvenue au café. Que souhaitez-vous commander?", botTrans: "Hello! Welcome to the cafe. What would you like to order?" }
            ],
            chatSuggestions: [
                "☕ Un café crème, s'il vous plaît.",
                "🥐 Un croissant au beurre.",
                "💳 Est-ce que vous acceptez la carte?"
            ]
        },
        de: {
            name: "German",
            code: "de-DE",
            heroWord: "Hallo! Wie geht es Ihnen?",
            heroPhonetic: "/ˈha.loː viː ɡeːt ɛs ˈiːnən/",
            heroTranslation: "Hello! How are you?",
            avatar: "Lukas (Berlin, Germany)",
            cards: [
                { word: "Ich hätte gerne einen Kaffee", phonetic: "/ɪç ˈhɛtə ˈɡɛʁnə ˈaɪ̯nən ˈkafe/", meaning: "I would like a coffee" },
                { word: "Wo ist der Bahnhof?", phonetic: "/voː ɪst deːɐ̯ ˈbaːnˌhoːf/", meaning: "Where is the station?" }
            ],
            chatInit: [
                { bot: "Guten Tag! Willkommen im Café. Was kann ich Ihnen bringen?", botTrans: "Good day! Welcome to the cafe. What can I bring you?" }
            ],
            chatSuggestions: [
                "☕ Einen Cappuccino bitte.",
                "🍰 Ein Stück Kuchen bitte."
            ]
        },
        ja: {
            name: "Japanese",
            code: "ja-JP",
            heroWord: "こんにちは！お元気ですか？",
            heroPhonetic: "/Konnichiwa! Ogenki desu ka?/",
            heroTranslation: "Hello! How are you?",
            avatar: "Ren (Tokyo, Japan)",
            cards: [
                { word: "コーヒーをください", phonetic: "/Kōhī o kudasai/", meaning: "A coffee please" },
                { word: "駅はどこですか？", phonetic: "/Eki wa doko desu ka?/", meaning: "Where is the station?" }
            ],
            chatInit: [
                { bot: "いらっしゃいませ！何にしますか？", botTrans: "Welcome! What will you have?" }
            ],
            chatSuggestions: [
                "☕ アイスコーヒーを一つお願いします。",
                "💳 カードは使えますか？"
            ]
        }
    };

    let currentLangKey = 'es';
    let cardIndex = 0;

    const heroVocabWord = document.getElementById('heroVocabWord');
    const heroVocabPhonetic = document.getElementById('heroVocabPhonetic');
    const heroVocabTranslation = document.getElementById('heroVocabTranslation');
    const btnHeroListen = document.getElementById('btnHeroListen');

    const practiceWord = document.getElementById('practiceWord');
    const practicePhonetic = document.getElementById('practicePhonetic');
    const practiceMeaning = document.getElementById('practiceMeaning');
    const activeLangLabel = document.getElementById('activeLangLabel');
    const currentCardIndex = document.getElementById('currentCardIndex');
    const btnPracticeListen = document.getElementById('btnPracticeListen');
    const btnPracticeMic = document.getElementById('btnPracticeMic');
    const btnNextCard = document.getElementById('btnNextCard');
    const resultBar = document.getElementById('resultBar');

    const avatarName = document.getElementById('avatarName');
    const chatFeed = document.getElementById('chatFeed');
    const chatSuggestionsContainer = document.querySelector('.chat-suggestions');

    window.setLanguage = function(key) {
        if (!languageData[key]) key = 'es';
        currentLangKey = key;
        cardIndex = 0;

        const data = languageData[key];

        if (heroVocabWord) heroVocabWord.textContent = data.heroWord;
        if (heroVocabPhonetic) heroVocabPhonetic.textContent = data.heroPhonetic;
        if (heroVocabTranslation) heroVocabTranslation.textContent = data.heroTranslation;

        document.querySelectorAll('.hero-lang-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.lang === key);
        });

        document.querySelectorAll('.lang-card').forEach(card => {
            card.classList.toggle('active', card.dataset.langCode === key);
        });

        renderPracticeCard();

        if (avatarName) avatarName.textContent = data.avatar;
        renderChatSection(data);
    };

    function renderPracticeCard() {
        const data = languageData[currentLangKey];
        if (!data || !data.cards) return;
        const cards = data.cards;
        const card = cards[cardIndex % cards.length];

        if (practiceWord) practiceWord.textContent = card.word;
        if (practicePhonetic) practicePhonetic.textContent = card.phonetic;
        if (practiceMeaning) practiceMeaning.textContent = `"${card.meaning}"`;
        if (activeLangLabel) activeLangLabel.textContent = `Active: ${data.name}`;
        if (currentCardIndex) currentCardIndex.textContent = (cardIndex % cards.length) + 1;

        if (resultBar) resultBar.classList.remove('show');
    }

    function renderChatSection(data) {
        if (!chatFeed) return;
        chatFeed.innerHTML = '';
        data.chatInit.forEach(msg => {
            if (msg.bot) {
                const b = document.createElement('div');
                b.className = 'chat-bubble bot';
                b.innerHTML = `<div class="chat-bubble-lang">${data.name.toUpperCase()}</div>${msg.bot}<div class="chat-bubble-translation">${msg.botTrans}</div>`;
                chatFeed.appendChild(b);
            }
            if (msg.user) {
                const u = document.createElement('div');
                u.className = 'chat-bubble user';
                u.innerHTML = `<div class="chat-bubble-lang">YOUR RESPONSE</div>${msg.user}<div class="chat-bubble-translation">${msg.userTrans}</div>`;
                chatFeed.appendChild(u);
            }
        });

        if (chatSuggestionsContainer) {
            chatSuggestionsContainer.innerHTML = '';
            data.chatSuggestions.forEach(sug => {
                const btn = document.createElement('button');
                btn.className = 'chip-suggestion';
                btn.textContent = sug;
                btn.addEventListener('click', () => sendUserMessage(sug));
                chatSuggestionsContainer.appendChild(btn);
            });
        }
    }

    document.querySelectorAll('.hero-lang-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            registerOngoingAction('learn');
            setLanguage(pill.dataset.lang);
        });
    });

    document.querySelectorAll('.lang-card').forEach(card => {
        card.addEventListener('click', () => {
            registerOngoingAction('learn');
            setLanguage(card.dataset.langCode);
        });
    });

    /* ----------------------------------------------------------------------
       5. SPEECH SYNTHESIS ENGINE
       ---------------------------------------------------------------------- */
    function speakText(text, langCode) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langCode || languageData[currentLangKey].code || 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    if (btnHeroListen) btnHeroListen.addEventListener('click', () => speakText(heroVocabWord.textContent));
    if (btnPracticeListen) {
        btnPracticeListen.addEventListener('click', () => {
            registerOngoingAction('practice');
            speakText(practiceWord.textContent);
        });
    }

    /* ----------------------------------------------------------------------
       6. CANVAS WAVEFORM ANIMATION & MIC SIMULATION
       ---------------------------------------------------------------------- */
    const canvas = document.getElementById('waveformCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isRecording = false;

        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth || 300;
            canvas.height = 50;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function drawWaveform() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bars = 30;
            const barWidth = (canvas.width / bars) - 4;

            for (let i = 0; i < bars; i++) {
                const height = isRecording 
                    ? Math.random() * (canvas.height - 10) + 10 
                    : 6 + Math.sin(Date.now() * 0.005 + i) * 4;

                const x = i * (barWidth + 4);
                const y = (canvas.height - height) / 2;

                ctx.fillStyle = isRecording ? '#FF7657' : '#B8E13A';
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, height, 4);
                ctx.fill();
            }

            requestAnimationFrame(drawWaveform);
        }
        drawWaveform();

        if (btnPracticeMic) {
            btnPracticeMic.addEventListener('click', () => {
                registerOngoingAction('practice');
                if (!isRecording) {
                    isRecording = true;
                    btnPracticeMic.classList.add('recording');
                    btnPracticeMic.innerHTML = '⏹️';
                    if (resultBar) resultBar.classList.remove('show');

                    setTimeout(() => {
                        isRecording = false;
                        btnPracticeMic.classList.remove('recording');
                        btnPracticeMic.innerHTML = '🎙️';
                        if (resultBar) resultBar.classList.add('show');
                    }, 2500);
                }
            });
        }
    }

    if (btnNextCard) {
        btnNextCard.addEventListener('click', () => {
            registerOngoingAction('practice');
            cardIndex++;
            renderPracticeCard();
        });
    }

    /* ----------------------------------------------------------------------
       7. CHAT FEED MESSAGING
       ---------------------------------------------------------------------- */
    const chatInput = document.getElementById('chatInput');
    const btnSendChat = document.getElementById('btnSendChat');

    function sendUserMessage(text) {
        registerOngoingAction('talk');
        const msgText = text || (chatInput ? chatInput.value.trim() : '');
        if (!msgText) return;

        if (chatFeed) {
            const u = document.createElement('div');
            u.className = 'chat-bubble user';
            u.innerHTML = `<div class="chat-bubble-lang">YOUR RESPONSE</div>${msgText}`;
            chatFeed.appendChild(u);
            chatFeed.scrollTop = chatFeed.scrollHeight;
        }

        if (chatInput) chatInput.value = '';
        speakText(msgText);

        setTimeout(() => {
            if (chatFeed) {
                const b = document.createElement('div');
                b.className = 'chat-bubble bot';
                b.innerHTML = `<div class="chat-bubble-lang">${languageData[currentLangKey].name.toUpperCase()}</div>¡Excelente pronunciación! Continuemos con el ejercicio.<div class="chat-bubble-translation">Excellent pronunciation! Let's continue with the exercise.</div>`;
                chatFeed.appendChild(b);
                chatFeed.scrollTop = chatFeed.scrollHeight;
            }
            speakText("¡Excelente pronunciación! Continuemos con el ejercicio.");
        }, 1200);
    }

    if (btnSendChat) btnSendChat.addEventListener('click', () => sendUserMessage());
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendUserMessage();
        });
    }

    /* ----------------------------------------------------------------------
       8. FAQ ACCORDION TOGGLE
       ---------------------------------------------------------------------- */
    document.querySelectorAll('.faq-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('open');
        });
    });

    /* ----------------------------------------------------------------------
       9. CONTACT FORM SUBMISSION HANDLER
       ---------------------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerOngoingAction('contact');
            alert('Thank you for reaching out to WeTalksy! Our support team will respond to your inquiry within 2 hours.');
            contactForm.reset();
        });
    }

    // Default Initialization
    setLanguage('es');
});
