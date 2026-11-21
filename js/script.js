/* ==========================================================================
   Invitación Digital VIP - Johnny Medina
   JavaScript Logic: Countdown, YouTube API Autoplay, Confetti, RSVP & Dialog
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Target Event Date: 26 de Noviembre de 2026, 19:00 hrs
  const EVENT_DATE = new Date('2026-11-26T19:00:00-05:00').getTime();

  // Countdown Elements
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = EVENT_DATE - now;

    if (distance < 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      const labelEl = document.querySelector('.section-label');
      if (labelEl) labelEl.textContent = '🎉 ¡EL GRAN DÍA HA LLEGADO! 🎉';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 2. Toast Notification Helper
  const toastEl = document.getElementById('toastMsg');
  function showToast(message) {
    if (!toastEl) return;
    toastEl.querySelector('.toast-text').textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // 3. YouTube Music Integration (La Jeepeta Remix - r-GBckkgez0)
  let ytPlayer = null;
  let isYtReady = false;
  let isMusicPlaying = false;
  const audioBtn = document.getElementById('audioBtn');
  const audioStatusEl = audioBtn ? audioBtn.querySelector('.audio-status') : null;

  function updateAudioUi(playing) {
    isMusicPlaying = playing;
    if (audioBtn) {
      if (playing) {
        audioBtn.classList.add('playing');
        if (audioStatusEl) audioStatusEl.textContent = 'Pausar';
      } else {
        audioBtn.classList.remove('playing');
        if (audioStatusEl) audioStatusEl.textContent = 'Música';
      }
    }
  }

  // Load YouTube Iframe API dynamically
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtubePlayer', {
      height: '1',
      width: '1',
      videoId: 'r-GBckkgez0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        loop: 1,
        playlist: 'r-GBckkgez0',
        modestbranding: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: (event) => {
          isYtReady = true;
          // Pre-set volume
          event.target.setVolume(100);
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            updateAudioUi(true);
          } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            updateAudioUi(false);
          }
        }
      }
    });
  };

  function playMusic() {
    if (ytPlayer && isYtReady && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        updateAudioUi(true);
      } catch (e) {
        console.warn('Playback error:', e);
      }
    } else {
      // Retry in 300ms if iframe API still initializing
      setTimeout(() => {
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo();
          updateAudioUi(true);
        }
      }, 300);
    }
  }

  function pauseMusic() {
    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      ytPlayer.pauseVideo();
      updateAudioUi(false);
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (isMusicPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

  // 4. Welcome Envelope / Screen VIP (Autoplay Trigger & Entrance)
  const welcomeScreen = document.getElementById('welcomeScreen');
  const openInvitationBtn = document.getElementById('openInvitationBtn');

  if (openInvitationBtn && welcomeScreen) {
    openInvitationBtn.addEventListener('click', (e) => {
      // Trigger music playback immediately on user interaction
      playMusic();

      // Launch celebration confetti
      const rect = openInvitationBtn.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

      // Smooth envelope exit
      welcomeScreen.classList.add('opened');

      showToast('🎶 Reproduciendo: La Jeepeta (Remix)');
    });
  }

  // 5. Canvas Confetti Particle Engine
  const canvas = document.getElementById('sparkleCanvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 3;
      this.gravity = 0.22;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.01;
      this.size = Math.random() * 7 + 4;
      this.color = ['#fbe285', '#d4af37', '#ffffff', '#e5c058', '#aa771c'][Math.floor(Math.random() * 5)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.alpha -= this.decay;
      this.rotation += this.rotationSpeed;
    }

    draw(context) {
      context.save();
      context.globalAlpha = Math.max(0, this.alpha);
      context.translate(this.x, this.y);
      context.rotate((this.rotation * Math.PI) / 180);
      context.fillStyle = this.color;
      context.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      context.restore();
    }
  }

  function launchConfetti(x, y) {
    for (let i = 0; i < 90; i++) {
      particles.push(new Particle(x, y));
    }
  }

  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animateParticles);
  }
  requestAnimationFrame(animateParticles);

  // 6. Toast Button (Brindar con Johnny)
  const toastCheersBtn = document.getElementById('toastCheersBtn');
  if (toastCheersBtn) {
    toastCheersBtn.addEventListener('click', () => {
      const rect = toastCheersBtn.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      showToast('🥂 ¡Salud por los 36 años de Johnny!');
    });
  }

  // 7. Copy Address to Clipboard
  const copyBtn = document.getElementById('copyAddressBtn');
  const addressText = 'Mz C Lote 9 asoc. La victoria';

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(addressText);
        showToast('¡Dirección copiada al portapapeles!');
      } catch (err) {
        const tempInput = document.createElement('input');
        tempInput.value = addressText;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('¡Dirección copiada!');
      }
    });
  }

  // 8. RSVP Dynamic WhatsApp Message (with choice of attendees)
  const whatsappRsvpLink = document.getElementById('whatsappRsvpLink');
  const attendeeRadios = document.querySelectorAll('input[name="attendeeCount"]');
  const WHATSAPP_NUMBER = '51955843714';

  function updateRsvpLink() {
    if (!whatsappRsvpLink) return;
    const selected = document.querySelector('input[name="attendeeCount"]:checked');
    const countText = selected ? selected.value : '1 persona';
    const message = `¡Hola Johnny! Confirmo con mucha alegría mi asistencia (${countText}) a tu cumpleaños de 36 años. Mi nombre es: `;
    whatsappRsvpLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  attendeeRadios.forEach((radio) => {
    radio.addEventListener('change', updateRsvpLink);
  });
  updateRsvpLink();

  // 9. Sugerir Canción para la Fiesta (WhatsApp)
  const sendSongBtn = document.getElementById('sendSongBtn');
  const songNameInput = document.getElementById('songNameInput');

  if (sendSongBtn && songNameInput) {
    sendSongBtn.addEventListener('click', () => {
      const song = songNameInput.value.trim();
      if (!song) {
        showToast('Por favor escribe el nombre de una canción');
        songNameInput.focus();
        return;
      }
      const message = `¡Hola Johnny! Te sugiero que pongas esta canción en la fiesta para bailar: "${song}"`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      showToast('¡Sugerencia enviada a WhatsApp!');
      songNameInput.value = '';
    });
  }

  // 10. Native Gift Dialog (Yape / Plin)
  const giftDialog = document.getElementById('giftDialog');
  const openGiftDialogBtn = document.getElementById('openGiftDialogBtn');
  const closeGiftDialogBtn = document.getElementById('closeGiftDialogBtn');
  const closeGiftDialogBottomBtn = document.getElementById('closeGiftDialogBottomBtn');
  const copyYapeBtn = document.getElementById('copyYapeBtn');

  if (openGiftDialogBtn && giftDialog) {
    openGiftDialogBtn.addEventListener('click', () => {
      giftDialog.showModal();
    });
  }

  if (closeGiftDialogBtn && giftDialog) {
    closeGiftDialogBtn.addEventListener('click', () => {
      giftDialog.close();
    });
  }

  if (closeGiftDialogBottomBtn && giftDialog) {
    closeGiftDialogBottomBtn.addEventListener('click', () => {
      giftDialog.close();
    });
  }

  if (giftDialog) {
    // Click outside to close (light dismiss)
    giftDialog.addEventListener('click', (e) => {
      const rect = giftDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        giftDialog.close();
      }
    });
  }

  if (copyYapeBtn) {
    copyYapeBtn.addEventListener('click', async () => {
      const yapeNumber = '955843714';
      try {
        await navigator.clipboard.writeText(yapeNumber);
        showToast('¡Número de Yape copiado: 955 843 714!');
      } catch (err) {
        showToast('Número: 955 843 714');
      }
    });
  }

  // 11. Scroll Entrance Animation (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    observer.observe(el);
  });
});
