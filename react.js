(function(){
  /* ============ LOADING SCREEN ============ */
  const loadingScreen = document.getElementById('loading-screen');
  if(loadingScreen){
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        loadingScreen.remove();
        initScrollAnimations();
      }, 800);
    }, 2800);
  } else {
    initScrollAnimations();
  }

  /* ============ SCROLL-TRIGGERED ENTRANCE ANIMATIONS ============ */
  function initScrollAnimations(){
    const revealElements = document.querySelectorAll(
      '.reveal-child, .reveal-scale, .reveal-left, .reveal-right'
    );
    if(!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReducedMotion){
      revealElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  }

  /* ============ SCROLL PROGRESS ============ */
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
  });

  /* ============ COUNTDOWN ============ */
  function nextBirthday(){
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(year, 7, 19, 0, 0, 0);
    if(target.getTime() <= now.getTime()){
      target = new Date(year + 1, 7, 19, 0, 0, 0);
    }
    return target;
  }

  const target = nextBirthday();
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };
  const countdownBox = document.getElementById('countdown');
  const arrivedMsg = document.getElementById('arrived-msg');
  let countdownReached = false;

  function tick(){
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if(diff <= 0){
      countdownBox.style.display = 'none';
      arrivedMsg.style.display = 'block';
      clearInterval(timer);
      if(!countdownReached){
        countdownReached = true;
        triggerFireworks();
      }
      return;
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    els.days.textContent = d;
    els.hours.textContent = String(h).padStart(2,'0');
    els.mins.textContent = String(m).padStart(2,'0');
    els.secs.textContent = String(s).padStart(2,'0');
  }
  tick();
  const timer = setInterval(tick, 1000);

  /* ============ CONFETTI ============ */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const confettiColors = ['#E85D8A', '#9B6DD7', '#4DC98A', '#FFD166', '#FF7F7F', '#FFB088'];
  let particles = [];
  let confettiRunning = false;

  function burstConfetti(originX, originY){
    for(let i=0; i<80; i++){
      const angle = (Math.PI * 2 / 80) * i;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random()*8 + 4,
        color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
        rot: Math.random()*360,
        vrot: (Math.random()-0.5) * 12,
        life: 0,
        maxLife: 100 + Math.random()*50,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if(!confettiRunning){
      confettiRunning = true;
      requestAnimationFrame(animateConfetti);
    }
  }

  function animateConfetti(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    particles.forEach(p => {
      p.vy += 0.18;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vrot;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life/p.maxLife);
      if(p.shape === 'rect'){
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    particles = particles.filter(p => p.life < p.maxLife && p.y < canvas.height + 40);
    if(particles.length > 0){
      requestAnimationFrame(animateConfetti);
    } else {
      confettiRunning = false;
      ctx.clearRect(0,0,canvas.width, canvas.height);
    }
  }

  /* ============ FIREWORKS ============ */
  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas.getContext('2d');
  function resizeFWCanvas(){
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  }
  resizeFWCanvas();
  window.addEventListener('resize', resizeFWCanvas);

  let fwParticles = [];
  let fwRunning = false;
  const fwColors = ['#E85D8A', '#9B6DD7', '#4DC98A', '#FFD166', '#FFB088', '#FF7F7F', '#C9A0ED'];

  function createFirework(x, y){
    const count = 70 + Math.floor(Math.random() * 50);
    for(let i = 0; i < count; i++){
      const angle = (Math.PI * 2 / count) * i;
      const speed = 2 + Math.random() * 5;
      fwParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color: fwColors[Math.floor(Math.random() * fwColors.length)],
        life: 0,
        maxLife: 70 + Math.random() * 35,
        gravity: 0.04,
        trail: []
      });
    }
  }

  function triggerFireworks(){
    const overlay = document.getElementById('fireworks-overlay');
    overlay.classList.remove('hidden');
    let burstCount = 0;
    const maxBursts = 10;

    function burst(){
      if(burstCount >= maxBursts){
        setTimeout(() => overlay.classList.add('hidden'), 2000);
        return;
      }
      const x = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2;
      const y = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1;
      createFirework(x, y);
      burstCount++;
      if(!fwRunning){
        fwRunning = true;
        requestAnimationFrame(animateFireworks);
      }
      setTimeout(burst, 350 + Math.random() * 350);
    }
    burst();
  }

  function animateFireworks(){
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    fwParticles.forEach(p => {
      p.trail.push({ x: p.x, y: p.y });
      if(p.trail.length > 5) p.trail.shift();
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life++;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      // Draw trail
      if(p.trail.length > 1){
        fwCtx.save();
        fwCtx.globalAlpha = alpha * 0.3;
        fwCtx.strokeStyle = p.color;
        fwCtx.lineWidth = 1;
        fwCtx.beginPath();
        fwCtx.moveTo(p.trail[0].x, p.trail[0].y);
        p.trail.forEach(t => fwCtx.lineTo(t.x, t.y));
        fwCtx.stroke();
        fwCtx.restore();
      }
      // Draw particle
      fwCtx.save();
      fwCtx.globalAlpha = alpha;
      fwCtx.fillStyle = p.color;
      fwCtx.beginPath();
      fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();
    });
    fwParticles = fwParticles.filter(p => p.life < p.maxLife);
    if(fwParticles.length > 0){
      requestAnimationFrame(animateFireworks);
    } else {
      fwRunning = false;
      fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    }
  }

  /* ============ CAKE / CANDLES ============ */
  const cake = document.getElementById('cake');
  const cakeHint = document.getElementById('cake-hint');
  let blown = false;

  function blowCandles(){
    if(blown) return;
    blown = true;
    cake.classList.add('blown');
    cakeHint.textContent = '✨ wish made — happy birthday, Kinjal! ✨';
    cakeHint.style.animation = 'none';
    cakeHint.style.opacity = '1';
    const rect = cake.getBoundingClientRect();
    burstConfetti(rect.left + rect.width/2, rect.top + rect.height*0.3);
    setTimeout(() => {
      document.getElementById('cta-hero').classList.remove('hidden');
    }, 1500);
  }
  cake.addEventListener('click', blowCandles);
  cake.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); blowCandles(); }
  });

  /* ============ MUSIC BOX MELODY ============ */
  const musicBtn = document.getElementById('music-toggle');
  let audioCtx = null;
  let playing = false;
  let scheduleTimeout = null;

  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33,
                  523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 587.33];
  const noteDuration = 0.32;

  function playNote(freq, when){
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(0.18, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.6);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(when);
    osc.stop(when + 0.65);
  }

  function scheduleLoop(){
    if(!playing) return;
    const now = audioCtx.currentTime;
    notes.forEach((freq, i) => {
      playNote(freq, now + i * noteDuration);
    });
    scheduleTimeout = setTimeout(scheduleLoop, notes.length * noteDuration * 1000);
  }

  musicBtn.addEventListener('click', () => {
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === 'suspended'){
      audioCtx.resume();
    }
    playing = !playing;
    musicBtn.classList.toggle('playing', playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
    if(playing){
      scheduleLoop();
    } else if(scheduleTimeout){
      clearTimeout(scheduleTimeout);
    }
  });

  /* ============ AGE CALCULATOR ============ */
  const fixedAge = 20;
  const birthYear = new Date().getFullYear() - fixedAge;
  const birthday = new Date(birthYear, 7, 19);
  const now = new Date();
  const ageMs = now.getTime() - birthday.getTime();
  const ageDays = Math.floor(ageMs / (1000*60*60*24));
  const ageHours = Math.floor(ageMs / (1000*60*60));
  const ageMins = Math.floor(ageMs / (1000*60));
  const yearsOld = fixedAge;
  const heartbeats = Math.floor(ageMins * 72);
  const smiles = Math.floor(ageDays * 4.5);

  function animateNumber(el, target, duration){
    const start = 0;
    const startTime = performance.now();
    function update(currentTime){
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = current.toLocaleString();
      if(progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  setTimeout(() => {
    animateNumber(document.getElementById('age-years'), yearsOld, 1500);
    animateNumber(document.getElementById('age-days'), ageDays, 2000);
    animateNumber(document.getElementById('age-hours'), ageHours, 2200);
    animateNumber(document.getElementById('age-mins'), ageMins, 2500);
    animateNumber(document.getElementById('age-hearts'), heartbeats, 2800);
    animateNumber(document.getElementById('age-smiles'), Math.floor(smiles), 3000);
  }, 500);

  /* ============ PARALLAX SCROLL ============ */
  const parallaxSections = document.querySelectorAll('.parallax-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if(entry.isIntersecting){
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
      }
    });
  }, { threshold: 0.1 });

  parallaxSections.forEach(section => observer.observe(section));

  /* ============ LETTER REVEAL ============ */
  const envelope = document.getElementById('envelope');
  envelope.addEventListener('click', () => {
    envelope.classList.toggle('opened');
  });

  /* ============ QUIZ ============ */
  const quizData = [
    {
      question: "What's Kinjal's birthday month?",
      options: ["July", "August", "September", "October"],
      correct: 1
    },
    {
      question: "What does Kinjal's laugh do?",
      options: ["Nothing special", "Lights up rooms", "Makes people cry", "Goes unnoticed"],
      correct: 1
    },
    {
      question: "What quality makes Kinjal special?",
      options: ["Her cooking", "Her kindness", "Her math skills", "Her singing"],
      correct: 1
    },
    {
      question: "How many candles are on the cake?",
      options: ["1", "2", "3", "4"],
      correct: 2
    },
    {
      question: "What does Kinjal make everyone around her feel?",
      options: ["Invisible", "Seen", "Scared", "Bored"],
      correct: 1
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizProgress = document.getElementById('quiz-progress');
  const quizCard = document.getElementById('quiz-card');
  const quizResult = document.getElementById('quiz-result');
  const quizScore = document.getElementById('quiz-score');
  const quizMessage = document.getElementById('quiz-message');
  const quizRetry = document.getElementById('quiz-retry');

  function showQuestion(){
    const q = quizData[currentQuestion];
    quizProgress.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => selectAnswer(i));
      quizOptions.appendChild(btn);
    });
  }

  function selectAnswer(index){
    const q = quizData[currentQuestion];
    const options = quizOptions.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
      opt.classList.add('disabled');
      if(i === q.correct) opt.classList.add('correct');
      if(i === index && i !== q.correct) opt.classList.add('wrong');
    });
    if(index === q.correct) score++;

    setTimeout(() => {
      currentQuestion++;
      if(currentQuestion < quizData.length){
        showQuestion();
      } else {
        showResult();
      }
    }, 1200);
  }

  function showResult(){
    quizCard.style.display = 'none';
    quizProgress.style.display = 'none';
    quizResult.classList.remove('hidden');
    quizScore.textContent = `${score}/${quizData.length}`;
    if(score === quizData.length){
      quizMessage.textContent = "You know Kinjal perfectly! You're a true friend! 🌟";
    } else if(score >= 3){
      quizMessage.textContent = "Great job! You know Kinjal pretty well! 🎉";
    } else {
      quizMessage.textContent = "Better luck next time! Get to know Kinjal more! 💕";
    }
  }

  quizRetry.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    quizCard.style.display = 'block';
    quizProgress.style.display = 'block';
    quizResult.classList.add('hidden');
    showQuestion();
  });

  showQuestion();

  /* ============ LIGHTBOX GALLERY ============ */
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const polaroids = document.querySelectorAll('.polaroid');
  let currentSlide = 0;

  function showLightbox(index){
    currentSlide = index;
    const polaroid = polaroids[index];
    const img = polaroid.querySelector('img');
    const frame = polaroid.querySelector('.frame');
    if(img){
      lightboxContent.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '">';
    } else if(frame){
      const svg = frame.querySelector('svg');
      if(svg) lightboxContent.innerHTML = svg.outerHTML;
    }
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  }

  polaroids.forEach((p, i) => {
    p.addEventListener('click', () => showLightbox(i));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSlide = (currentSlide - 1 + polaroids.length) % polaroids.length;
    showLightbox(currentSlide);
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSlide = (currentSlide + 1) % polaroids.length;
    showLightbox(currentSlide);
  });

  document.addEventListener('keydown', (e) => {
    if(lightbox.classList.contains('hidden')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') lightboxPrev.click();
    if(e.key === 'ArrowRight') lightboxNext.click();
  });

  /* ============ WISHES WALL ============ */
  const wishesGrid = document.getElementById('wishes-grid');
  const wishName = document.getElementById('wish-name');
  const wishMessage = document.getElementById('wish-message');
  const wishSubmit = document.getElementById('wish-submit');

  const defaultWishes = [
    { name: "A Friend", text: "Wishing you a day filled with happiness and a year filled with joy! 🎂" },
    { name: "Best Wishes", text: "May all your dreams and wishes come true on this special day! ✨" },
    { name: "With Love", text: "Happy Birthday! You deserve all the wonderful things life has to offer! 🌸" }
  ];

  let wishes = JSON.parse(localStorage.getItem('kinjal-wishes') || 'null') || [...defaultWishes];

  function renderWishes(){
    wishesGrid.innerHTML = '';
    wishes.forEach((w, i) => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.style.transform = `rotate(${(i % 2 === 0 ? -2 : 1.5) + (Math.random() - 0.5) * 2}deg)`;
      card.innerHTML = `
        <div class="wish-name">${escapeHtml(w.name)}</div>
        <div class="wish-text">${escapeHtml(w.text)}</div>
        <div class="wish-flip-hint">click to celebrate 🎉</div>
      `;
      card.addEventListener('click', () => {
        burstConfetti(
          card.getBoundingClientRect().left + card.offsetWidth / 2,
          card.getBoundingClientRect().top + card.offsetHeight / 2
        );
      });
      wishesGrid.appendChild(card);
    });
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  wishSubmit.addEventListener('click', () => {
    const name = wishName.value.trim() || 'Anonymous';
    const text = wishMessage.value.trim();
    if(!text) return;
    wishes.unshift({ name, text });
    localStorage.setItem('kinjal-wishes', JSON.stringify(wishes));
    wishName.value = '';
    wishMessage.value = '';
    renderWishes();
  });

  renderWishes();

  /* ============ GIFT REVEAL ============ */
  const giftBox = document.getElementById('gift-box');
  const giftLid = document.getElementById('gift-lid');
  const giftSurprise = document.getElementById('gift-surprise');
  let giftOpened = false;

  giftBox.addEventListener('click', () => {
    if(giftOpened) return;
    giftOpened = true;
    giftBox.classList.add('opened');
    giftSurprise.classList.remove('hidden');
    setTimeout(() => {
      triggerFireworks();
    }, 300);
  });

  /* ============ INITIALIZE: HIDE ALL SECTIONS EXCEPT HERO ============ */
  document.querySelectorAll('.section-hidden').forEach(el => {
    el.style.display = 'none';
  });
  window.revealSection = function(sectionId){
    const section = document.getElementById(sectionId);
    if(!section) return;
    section.style.display = '';
    section.classList.remove('section-hidden');
    section.classList.add('section-revealed');
    document.querySelectorAll('[data-reveal="'+sectionId+'"]').forEach(el => {
      el.style.display = '';
      el.classList.remove('section-hidden');
      el.classList.add('section-revealed');
    });
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  /* ============ PLAYLIST ============ */
  const playlistItems = document.querySelectorAll('.playlist-play');
  const nowPlaying = document.getElementById('now-playing');
  const nowPlayingSong = document.getElementById('now-playing-song');
  let currentPlaylistSong = null;

  const songMelodies = [
    [523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 523.25, 0],
    [392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00, 0],
    [523.25, 659.25, 783.99, 659.25, 523.25, 659.25, 783.99, 0],
    [659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25, 0],
    [440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00, 0]
  ];

  const songNames = [
    "Happy Birthday - Stevie Wonder",
    "Birthday - The Beatles",
    "Celebration - Kool & The Gang",
    "Don't Stop Me Now - Queen",
    "Good As Hell - Lizzo"
  ];

  function playMelody(index){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
    stopMelody();

    currentPlaylistSong = index;
    const melody = songMelodies[index];
    const now = audioCtx.currentTime;

    melody.forEach((freq, i) => {
      if(freq === 0) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.35);
      gain.gain.setValueAtTime(0, now + i * 0.35);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.35 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.35 + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.55);
    });

    playlistItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    nowPlaying.classList.remove('hidden');
    nowPlayingSong.textContent = songNames[index];

    setTimeout(() => {
      playlistItems.forEach(btn => btn.classList.remove('active'));
      nowPlaying.classList.add('hidden');
      currentPlaylistSong = null;
    }, melody.length * 350 + 200);
  }

  function stopMelody(){
    playlistItems.forEach(btn => btn.classList.remove('active'));
    nowPlaying.classList.add('hidden');
  }

  playlistItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      playMelody(index);
    });
  });

  /* ============ SPIN THE WHEEL ============ */
  const spinCanvas = document.getElementById('spin-wheel');
  const spinCtx = spinCanvas.getContext('2d');
  const spinBtn = document.getElementById('spin-btn');
  const wheelResult = document.getElementById('wheel-result');
  const wheelSegments = [
    { text: "You're a superstar! ⭐", color: "#FFD6E0" },
    { text: "Hugs & kisses! 💋", color: "#E8D5F5" },
    { text: "Dream big! 🌟", color: "#C8F7DC" },
    { text: "Smile always! 😊", color: "#FFD166" },
    { text: "You're loved! ❤️", color: "#FFD4B8" },
    { text: "Stay amazing! ✨", color: "#FF8FAB" },
    { text: "Best wishes! 🎁", color: "#C9A0ED" },
    { text: "Joy & peace! 🕊️", color: "#7EDEAA" }
  ];
  let wheelAngle = 0;
  let spinning = false;
  let wheelWinner = 0;

  function drawWheel(){
    const cx = spinCanvas.width / 2;
    const cy = spinCanvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    const segAngle = (Math.PI * 2) / wheelSegments.length;
    const offset = -Math.PI / 2;

    spinCtx.clearRect(0, 0, spinCanvas.width, spinCanvas.height);
    spinCtx.save();
    spinCtx.translate(cx, cy);
    spinCtx.rotate(wheelAngle);

    wheelSegments.forEach((seg, i) => {
      const startAngle = offset + i * segAngle;
      spinCtx.beginPath();
      spinCtx.moveTo(0, 0);
      spinCtx.arc(0, 0, r, startAngle, startAngle + segAngle);
      spinCtx.closePath();
      spinCtx.fillStyle = seg.color;
      spinCtx.fill();
      spinCtx.strokeStyle = 'rgba(255,255,255,0.5)';
      spinCtx.lineWidth = 2;
      spinCtx.stroke();

      spinCtx.save();
      spinCtx.rotate(startAngle + segAngle / 2);
      spinCtx.textAlign = 'right';
      spinCtx.fillStyle = '#4A2D5E';
      spinCtx.font = 'bold 12px Quicksand, sans-serif';
      spinCtx.fillText(seg.text, r - 16, 4);
      spinCtx.restore();
    });

    spinCtx.restore();

    var normalizedAngle = ((-wheelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    wheelWinner = Math.floor(normalizedAngle / segAngle + 0.5) % wheelSegments.length;
  }
  drawWheel();

  spinBtn.addEventListener('click', () => {
    if(spinning) return;
    spinning = true;
    wheelResult.classList.add('hidden');
    spinBtn.disabled = true;
    const extraSpins = 5 + Math.random() * 5;
    const targetAngle = wheelAngle + extraSpins * Math.PI * 2 + Math.random() * Math.PI * 2;
    const duration = 4000;
    const startTime = performance.now();
    const startAngle = wheelAngle;

    function animateSpin(now){
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      wheelAngle = startAngle + (targetAngle - startAngle) * eased;
      drawWheel();
      if(progress < 1){
        requestAnimationFrame(animateSpin);
      } else {
        spinning = false;
        spinBtn.disabled = false;
        wheelResult.textContent = wheelSegments[wheelWinner].text;
        wheelResult.classList.remove('hidden');
        burstConfetti(spinCanvas.getBoundingClientRect().left + spinCanvas.width / 2, spinCanvas.getBoundingClientRect().top + spinCanvas.height / 2);
      }
    }
    requestAnimationFrame(animateSpin);
  });

  /* ============ SCRATCH CARD ============ */
  const scratchCanvas = document.getElementById('scratch-canvas');
  const scratchCtx = scratchCanvas.getContext('2d');
  const scratchPct = document.getElementById('scratch-pct');
  let scratching = false;
  let scratchedPixels = 0;
  let totalPixels = scratchCanvas.width * scratchCanvas.height;
  let scratchRevealed = false;

  function initScratch(){
    scratchCtx.fillStyle = '#9B6DD7';
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    scratchCtx.fillStyle = '#E8D5F5';
    for(let i = 0; i < 60; i++){
      const x = Math.random() * scratchCanvas.width;
      const y = Math.random() * scratchCanvas.height;
      scratchCtx.beginPath();
      scratchCtx.arc(x, y, Math.random() * 15 + 5, 0, Math.PI * 2);
      scratchCtx.fill();
    }
    scratchCtx.font = 'bold 18px Fredoka, sans-serif';
    scratchCtx.fillStyle = 'rgba(74,45,94,0.3)';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('SCRATCH HERE!', scratchCanvas.width / 2, scratchCanvas.height / 2);
  }
  initScratch();

  function scratch(x, y){
    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 20, 0, Math.PI * 2);
    scratchCtx.fill();
    checkScratchProgress();
  }

  function checkScratchProgress(){
    const imageData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    let transparent = 0;
    for(let i = 3; i < imageData.data.length; i += 4){
      if(imageData.data[i] === 0) transparent++;
    }
    const pct = Math.floor((transparent / (imageData.data.length / 4)) * 100);
    scratchPct.textContent = pct + '%';
    if(pct >= 50 && !scratchRevealed){
      scratchRevealed = true;
      scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      burstConfetti(scratchCanvas.getBoundingClientRect().left + scratchCanvas.width / 2, scratchCanvas.getBoundingClientRect().top + scratchCanvas.height / 2);
    }
  }

  scratchCanvas.addEventListener('mousedown', (e) => { scratching = true; scratch(e.offsetX, e.offsetY); });
  scratchCanvas.addEventListener('mousemove', (e) => { if(scratching) scratch(e.offsetX, e.offsetY); });
  scratchCanvas.addEventListener('mouseup', () => scratching = false);
  scratchCanvas.addEventListener('mouseleave', () => scratching = false);
  scratchCanvas.addEventListener('touchstart', (e) => { scratching = true; const r = scratchCanvas.getBoundingClientRect(); scratch(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top); e.preventDefault(); });
  scratchCanvas.addEventListener('touchmove', (e) => { if(scratching){ const r = scratchCanvas.getBoundingClientRect(); scratch(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top); } e.preventDefault(); });
  scratchCanvas.addEventListener('touchend', () => scratching = false);

  /* ============ MEMORY MATCHING GAME ============ */
  const memoryGrid = document.getElementById('memory-grid');
  const memoryMoves = document.getElementById('memory-moves');
  const memoryPairs = document.getElementById('memory-pairs');
  const memoryReset = document.getElementById('memory-reset');
  const memoryEmojis = ['🎂', '🎈', '🎁', '🌟', '🎵', '💕'];
  let memoryCards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let memoryLocked = false;

  function initMemoryGame(){
    const pairs = [...memoryEmojis, ...memoryEmojis];
    memoryCards = pairs.sort(() => Math.random() - 0.5);
    matchedPairs = 0;
    moves = 0;
    flippedCards = [];
    memoryLocked = false;
    memoryMoves.textContent = '0';
    memoryPairs.textContent = '0';
    memoryGrid.innerHTML = '';
    memoryCards.forEach((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.index = i;
      card.innerHTML = `<div class="memory-card-inner"><div class="memory-card-front"></div><div class="memory-card-back">${emoji}</div></div>`;
      card.addEventListener('click', () => flipCard(card, i));
      memoryGrid.appendChild(card);
    });
  }

  function flipCard(card, index){
    if(memoryLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    flippedCards.push({ card, index, emoji: memoryCards[index] });
    if(flippedCards.length === 2){
      moves++;
      memoryMoves.textContent = moves;
      memoryLocked = true;
      const [a, b] = flippedCards;
      if(a.emoji === b.emoji){
        a.card.classList.add('matched');
        b.card.classList.add('matched');
        matchedPairs++;
        memoryPairs.textContent = matchedPairs;
        flippedCards = [];
        memoryLocked = false;
        if(matchedPairs === memoryEmojis.length){
          setTimeout(() => burstConfetti(memoryGrid.getBoundingClientRect().left + memoryGrid.offsetWidth / 2, memoryGrid.getBoundingClientRect().top + memoryGrid.offsetHeight / 2), 500);
        }
      } else {
        setTimeout(() => {
          a.card.classList.remove('flipped');
          b.card.classList.remove('flipped');
          flippedCards = [];
          memoryLocked = false;
        }, 800);
      }
    }
  }

  memoryReset.addEventListener('click', initMemoryGame);
  initMemoryGame();

  /* ============ DRAW A CAKE ============ */
  const drawCanvas = document.getElementById('draw-canvas');
  const drawCtx = drawCanvas.getContext('2d');
  const drawColors = document.querySelectorAll('.draw-color');
  const drawSize = document.getElementById('draw-size');
  const drawClear = document.getElementById('draw-clear');
  let drawing = false;
  let currentColor = '#FF8FAB';

  function drawBaseCake(){
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.fillStyle = '#FFFBFC';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.fillStyle = '#FFD4B8';
    drawCtx.beginPath();
    drawCtx.roundRect(100, 220, 200, 100, 12);
    drawCtx.fill();
    drawCtx.fillStyle = '#E8D5F5';
    drawCtx.beginPath();
    drawCtx.roundRect(120, 160, 160, 70, 10);
    drawCtx.fill();
    drawCtx.fillStyle = '#FFFBFC';
    drawCtx.fillRect(100, 220, 200, 14);
    drawCtx.fillRect(120, 160, 160, 12);
    drawCtx.fillStyle = '#FF8FAB';
    drawCtx.beginPath(); drawCtx.arc(160, 168, 5, 0, Math.PI * 2); drawCtx.fill();
    drawCtx.fillStyle = '#FFD166';
    drawCtx.beginPath(); drawCtx.arc(200, 165, 5, 0, Math.PI * 2); drawCtx.fill();
    drawCtx.fillStyle = '#7EDEAA';
    drawCtx.beginPath(); drawCtx.arc(240, 168, 5, 0, Math.PI * 2); drawCtx.fill();
    drawCtx.fillStyle = '#4A2D5E';
    drawCtx.font = 'bold 16px Fredoka, sans-serif';
    drawCtx.textAlign = 'center';
    drawCtx.fillText('Draw on the cake! 🎨', 200, 360);
  }
  drawBaseCake();

  drawColors.forEach(btn => {
    btn.addEventListener('click', () => {
      drawColors.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = btn.dataset.color;
    });
  });

  function getDrawPos(e){
    const r = drawCanvas.getBoundingClientRect();
    const scaleX = drawCanvas.width / r.width;
    const scaleY = drawCanvas.height / r.height;
    if(e.touches){
      return { x: (e.touches[0].clientX - r.left) * scaleX, y: (e.touches[0].clientY - r.top) * scaleY };
    }
    return { x: e.offsetX * scaleX, y: e.offsetY * scaleY };
  }

  drawCanvas.addEventListener('mousedown', (e) => { drawing = true; const p = getDrawPos(e); drawCtx.beginPath(); drawCtx.moveTo(p.x, p.y); });
  drawCanvas.addEventListener('mousemove', (e) => {
    if(!drawing) return;
    const p = getDrawPos(e);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.strokeStyle = currentColor;
    drawCtx.lineWidth = parseInt(drawSize.value);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.stroke();
  });
  drawCanvas.addEventListener('mouseup', () => drawing = false);
  drawCanvas.addEventListener('mouseleave', () => drawing = false);
  drawCanvas.addEventListener('touchstart', (e) => { drawing = true; const p = getDrawPos(e); drawCtx.beginPath(); drawCtx.moveTo(p.x, p.y); e.preventDefault(); });
  drawCanvas.addEventListener('touchmove', (e) => {
    if(!drawing) return;
    const p = getDrawPos(e);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.strokeStyle = currentColor;
    drawCtx.lineWidth = parseInt(drawSize.value);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.stroke();
    e.preventDefault();
  });
  drawCanvas.addEventListener('touchend', () => drawing = false);

  drawClear.addEventListener('click', drawBaseCake);

  /* ============ VOICE MESSAGES ============ */
  const voiceRecord = document.getElementById('voice-record');
  const voiceStop = document.getElementById('voice-stop');
  const voicePlay = document.getElementById('voice-play');
  const voiceStatus = document.getElementById('voice-status');
  const voiceTimer = document.getElementById('voice-timer');
  const voiceRecordings = document.getElementById('voice-recordings');
  let mediaRecorder = null;
  let audioChunks = [];
  let recordedBlob = null;
  let voiceTimerInterval = null;
  let voiceSeconds = 0;

  voiceRecord.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      voiceSeconds = 0;
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        voicePlay.disabled = false;
        voiceStatus.textContent = 'Recording saved! Click play to listen.';
        addRecordingToList(recordedBlob);
      };
      mediaRecorder.start();
      voiceRecord.classList.add('recording');
      voiceRecord.disabled = true;
      voiceStop.disabled = false;
      voiceStatus.textContent = 'Recording...';
      voiceTimerInterval = setInterval(() => {
        voiceSeconds++;
        const m = Math.floor(voiceSeconds / 60);
        const s = voiceSeconds % 60;
        voiceTimer.textContent = m + ':' + String(s).padStart(2, '0');
      }, 1000);
    } catch(err){
      voiceStatus.textContent = 'Microphone access denied.';
    }
  });

  voiceStop.addEventListener('click', () => {
    if(mediaRecorder && mediaRecorder.state !== 'inactive'){
      mediaRecorder.stop();
      voiceRecord.classList.remove('recording');
      voiceRecord.disabled = false;
      voiceStop.disabled = true;
      clearInterval(voiceTimerInterval);
    }
  });

  voicePlay.addEventListener('click', () => {
    if(recordedBlob){
      const url = URL.createObjectURL(recordedBlob);
      const audio = new Audio(url);
      audio.play();
      voiceStatus.textContent = 'Playing...';
      audio.onended = () => { voiceStatus.textContent = 'Playback finished.'; };
    }
  });

  function addRecordingToList(blob){
    const url = URL.createObjectURL(blob);
    const item = document.createElement('div');
    item.className = 'voice-recording-item';
    const time = new Date().toLocaleTimeString();
    item.innerHTML = `<button onclick="new Audio('${url}').play()">▶️</button><span>Voice message (${time})</span>`;
    voiceRecordings.prepend(item);
  }

  /* ============ BIRTHDAY TRIVIA (3D TILT) ============ */
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const centerX = r.width / 2;
      const centerY = r.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  /* ============ BIRTHDAY BINGO ============ */
  const bingoGrid = document.getElementById('bingo-grid');
  const bingoCount = document.getElementById('bingo-count');
  const bingoMessage = document.getElementById('bingo-message');
  const bingoItems = [
    ' blow out candles 🕯️', ' eat cake 🎂', ' open a gift 🎁',
    ' sing happy birthday 🎵', ' take a selfie 📸', ' make a wish ⭐',
    ' dance 💃', ' hug someone 🤗', ' eat more cake 🍰'
  ];
  let bingoMarked = new Set();

  function initBingo(){
    bingoGrid.innerHTML = '';
    bingoMarked = new Set();
    bingoCount.textContent = '0';
    bingoMessage.classList.add('hidden');
    bingoItems.forEach((item, i) => {
      const cell = document.createElement('div');
      cell.className = 'bingo-cell';
      cell.textContent = item;
      cell.addEventListener('click', () => {
        if(bingoMarked.has(i)){
          bingoMarked.delete(i);
          cell.classList.remove('marked');
        } else {
          bingoMarked.add(i);
          cell.classList.add('marked');
        }
        bingoCount.textContent = bingoMarked.size;
        if(bingoMarked.size === bingoItems.length){
          bingoMessage.classList.remove('hidden');
          burstConfetti(bingoGrid.getBoundingClientRect().left + bingoGrid.offsetWidth / 2, bingoGrid.getBoundingClientRect().top + bingoGrid.offsetHeight / 2);
        }
      });
      bingoGrid.appendChild(cell);
    });
  }
  initBingo();

  /* ============ WISH BALLOON RELEASE ============ */
  const balloonSky = document.getElementById('balloon-sky');
  const balloonWishInput = document.getElementById('balloon-wish-input');
  const balloonReleaseBtn = document.getElementById('balloon-release-btn');
  const balloonColors = ['#E85D8A', '#9B6DD7', '#4DC98A', '#FFD166', '#FFB088', '#FF7F7F', '#C9A0ED'];

  balloonReleaseBtn.addEventListener('click', () => {
    const text = balloonWishInput.value.trim();
    if(!text) return;
    const balloon = document.createElement('div');
    balloon.className = 'wish-balloon';
    balloon.style.left = Math.random() * (balloonSky.offsetWidth - 60) + 'px';
    balloon.style.background = `linear-gradient(135deg, ${balloonColors[Math.floor(Math.random() * balloonColors.length)]}, ${balloonColors[Math.floor(Math.random() * balloonColors.length)]})`;
    balloon.innerHTML = `<div class="wish-balloon-text">${escapeHtml(text)}</div>`;
    balloonSky.appendChild(balloon);
    balloonWishInput.value = '';
    setTimeout(() => balloon.remove(), 6500);
  });

  balloonWishInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') balloonReleaseBtn.click();
  });

  /* ============ GUESTBOOK ============ */
  const guestbookEntries = document.getElementById('guestbook-entries');
  const guestbookName = document.getElementById('guestbook-name');
  const guestbookMessage = document.getElementById('guestbook-message');
  const guestbookSubmit = document.getElementById('guestbook-submit');

  const defaultGuestbook = [
    { name: "A Dear Friend", message: "Happy Birthday Kinjal! You light up every room you walk into. Wishing you endless happiness!", time: "Aug 19, 2024" },
    { name: "With Love", message: "May this birthday bring you all the joy you deserve. You're truly one of a kind! 🌸", time: "Aug 19, 2024" }
  ];

  let guestbook = JSON.parse(localStorage.getItem('kinjal-guestbook') || 'null') || [...defaultGuestbook];

  function renderGuestbook(){
    guestbookEntries.innerHTML = '';
    guestbook.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'guestbook-entry';
      el.innerHTML = `
        <div class="guestbook-entry-name">${escapeHtml(entry.name)}</div>
        <div class="guestbook-entry-message">${escapeHtml(entry.message)}</div>
        <div class="guestbook-entry-time">${entry.time}</div>
      `;
      guestbookEntries.appendChild(el);
    });
  }

  guestbookSubmit.addEventListener('click', () => {
    const name = guestbookName.value.trim() || 'Anonymous';
    const message = guestbookMessage.value.trim();
    if(!message) return;
    const time = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    guestbook.unshift({ name, message, time });
    localStorage.setItem('kinjal-guestbook', JSON.stringify(guestbook));
    guestbookName.value = '';
    guestbookMessage.value = '';
    renderGuestbook();
    burstConfetti(guestbookEntries.getBoundingClientRect().left + guestbookEntries.offsetWidth / 2, guestbookEntries.getBoundingClientRect().top);
  });

  renderGuestbook();

  /* ============ TIME CAPSULE ============ */
  const capsuleForm = document.getElementById('capsule-form');
  const capsuleLocked = document.getElementById('capsule-locked');
  const capsuleRevealed = document.getElementById('capsule-revealed');
  const capsuleMessage = document.getElementById('capsule-message');
  const capsuleLock = document.getElementById('capsule-lock');
  const capsuleText = document.getElementById('capsule-text');
  const capsuleDate = document.getElementById('capsule-date');
  const capsuleCountdown = document.getElementById('capsule-countdown');

  const capsuleData = JSON.parse(localStorage.getItem('kinjal-capsule') || 'null');

  function updateCapsuleCountdown(){
    if(!capsuleData) return;
    const now = new Date();
    let next = new Date(now.getFullYear(), 7, 19, 0, 0, 0);
    if(now > next) next = new Date(now.getFullYear() + 1, 7, 19, 0, 0, 0);
    const diff = next - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    capsuleCountdown.textContent = `${days} days, ${hours} hours until reveal`;
  }

  if(capsuleData){
    const revealDate = new Date(capsuleData.revealAt);
    if(new Date() >= revealDate){
      capsuleForm.classList.add('hidden');
      capsuleLocked.classList.add('hidden');
      capsuleRevealed.classList.remove('hidden');
      capsuleText.textContent = capsuleData.message;
      capsuleDate.textContent = `Written on ${capsuleData.writtenAt}`;
    } else {
      capsuleForm.classList.add('hidden');
      capsuleLocked.classList.remove('hidden');
      updateCapsuleCountdown();
      setInterval(updateCapsuleCountdown, 60000);
    }
  }

  capsuleLock.addEventListener('click', () => {
    const message = capsuleMessage.value.trim();
    if(!message) return;
    const now = new Date();
    const nextBirthday = new Date(now.getFullYear(), 7, 19, 0, 0, 0);
    if(now > nextBirthday) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const data = {
      message: message,
      writtenAt: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      revealAt: nextBirthday.toISOString()
    };
    localStorage.setItem('kinjal-capsule', JSON.stringify(data));
    capsuleForm.classList.add('hidden');
    capsuleLocked.classList.remove('hidden');
    updateCapsuleCountdown();
    burstConfetti(capsuleLocked.getBoundingClientRect().left + capsuleLocked.offsetWidth / 2, capsuleLocked.getBoundingClientRect().top);
  });

  /* ============ KARAOKE MODE ============ */
  const karaokePlay = document.getElementById('karaoke-play');
  const karaokeLyrics = document.getElementById('karaoke-lyrics');
  const karaokeProgressBar = document.getElementById('karaoke-progress-bar');
  const karaokeLines = karaokeLyrics.querySelectorAll('.karaoke-line');
  const karaokeMelody = [261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
                         261.63, 261.63, 293.66, 261.63, 392.00, 349.23,
                         261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66,
                         466.16, 466.16, 440.00, 349.23, 392.00, 349.23];
  let karaokePlaying = false;

  karaokePlay.addEventListener('click', () => {
    if(karaokePlaying) return;
    karaokePlaying = true;
    karaokePlay.disabled = true;
    karaokePlay.textContent = 'Singing... 🎵';
    let currentLine = 0;
    const lineInterval = setInterval(() => {
      karaokeLines.forEach((l, i) => {
        l.classList.remove('active', 'sung');
        if(i < currentLine) l.classList.add('sung');
        if(i === currentLine) l.classList.add('active');
      });
      karaokeProgressBar.style.width = ((currentLine + 1) / karaokeLines.length * 100) + '%';
      if(currentLine < karaokeLines.length - 1){
        currentLine++;
      } else {
        clearInterval(lineInterval);
        setTimeout(() => {
          karaokeLines.forEach(l => { l.classList.remove('active', 'sung'); });
          karaokeProgressBar.style.width = '0%';
          karaokePlay.disabled = false;
          karaokePlay.textContent = 'Start Singing 🎵';
          karaokePlaying = false;
          burstConfetti(karaokeLyrics.getBoundingClientRect().left + karaokeLyrics.offsetWidth / 2, karaokeLyrics.getBoundingClientRect().top);
        }, 1500);
      }
    }, 2000);

    if(audioCtx){
      const now = audioCtx.currentTime;
      karaokeMelody.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.4);
        gain.gain.setValueAtTime(0, now + i * 0.4);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.4 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.4 + 0.45);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + i * 0.4);
        osc.stop(now + i * 0.4 + 0.5);
      });
    }
  });

  /* ============ REACTIONS ============ */
  const reactionBtns = document.querySelectorAll('.reaction-btn');
  let reactions = JSON.parse(localStorage.getItem('kinjal-reactions') || '{}');

  function renderReactions(){
    reactionBtns.forEach(btn => {
      const emoji = btn.dataset.emoji;
      btn.querySelector('.reaction-count').textContent = reactions[emoji] || 0;
    });
  }

  reactionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      localStorage.setItem('kinjal-reactions', JSON.stringify(reactions));
      renderReactions();
      const rect = btn.getBoundingClientRect();
      for(let i = 0; i < 5; i++){
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = emoji;
        heart.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 40) + 'px';
        heart.style.animationDuration = (3 + Math.random() * 2) + 's';
        document.getElementById('floating-hearts').appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
      }
    });
  });
  renderReactions();

  /* ============ FLOATING HEARTS ON CLICK ============ */
  document.addEventListener('click', (e) => {
    if(e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('a')) return;
    const hearts = ['❤️', '💕', '💖', '✨', '🌸', '🦋'];
    for(let i = 0; i < 3; i++){
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.left = (e.clientX + (Math.random() - 0.5) * 30) + 'px';
      heart.style.top = e.clientY + 'px';
      heart.style.fontSize = (1 + Math.random()) + 'rem';
      heart.style.animationDuration = (2.5 + Math.random() * 2) + 's';
      document.getElementById('floating-hearts').appendChild(heart);
      setTimeout(() => heart.remove(), 5000);
    }
  });

  /* ============ SCROLL PARTICLES ============ */
  const scrollCanvas = document.getElementById('scroll-particles-canvas');
  const scrollCtx = scrollCanvas.getContext('2d');
  let scrollParticlesArr = [];
  let lastScrollY = 0;

  function resizeScrollCanvas(){
    scrollCanvas.width = window.innerWidth;
    scrollCanvas.height = window.innerHeight;
  }
  resizeScrollCanvas();
  window.addEventListener('resize', resizeScrollCanvas);

  const sparkColors = ['#E85D8A', '#9B6DD7', '#4DC98A', '#FFD166', '#FFB088'];
  window.addEventListener('scroll', () => {
    const delta = Math.abs(window.scrollY - lastScrollY);
    if(delta > 10){
      const count = Math.min(Math.floor(delta / 20), 5);
      for(let i = 0; i < count; i++){
        scrollParticlesArr.push({
          x: Math.random() * scrollCanvas.width,
          y: scrollCanvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          size: 2 + Math.random() * 3,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          life: 0,
          maxLife: 60 + Math.random() * 40
        });
      }
    }
    lastScrollY = window.scrollY;
  });

  function animateScrollParticles(){
    scrollCtx.clearRect(0, 0, scrollCanvas.width, scrollCanvas.height);
    scrollParticlesArr.forEach(p => {
      p.vy -= 0.02;
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      scrollCtx.save();
      scrollCtx.globalAlpha = alpha;
      scrollCtx.fillStyle = p.color;
      scrollCtx.beginPath();
      scrollCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      scrollCtx.fill();
      scrollCtx.restore();
    });
    scrollParticlesArr = scrollParticlesArr.filter(p => p.life < p.maxLife && p.y > -10);
    requestAnimationFrame(animateScrollParticles);
  }
  animateScrollParticles();
})();