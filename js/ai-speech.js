/** Recorded reflection narration, with optional browser voices. */
class AIReflectionNarrator {
  constructor() {
    this.synth = window.speechSynthesis;
    this.browserVoices = [];
    this.speechSection = null;
    this.utterance = null;
    this.sections = {};
    ['midterm', 'finals'].forEach(section => {
      const container = document.getElementById(`${section}AiModule`);
      if (!container) return;
      const audio = new Audio(`assets/audio/${section}_reflection_christopher.mp3`);
      audio.preload = 'metadata';
      this.sections[section] = { container, audio, voice: 'christopher', state: 'stopped', version: 0 };
      container.querySelector('.btn-ai-play').addEventListener('click', () => this.toggle(section));
      container.querySelector('.voice-select').addEventListener('change', event => this.setVoice(section, event.target.value));
      container.querySelector('.ai-progress-slider').addEventListener('input', event => this.seek(section, Number(event.target.value)));
      audio.addEventListener('loadedmetadata', () => this.render(section));
      audio.addEventListener('timeupdate', () => this.renderProgress(section));
      audio.addEventListener('ended', () => {
        this.sections[section].state = 'stopped';
        audio.currentTime = 0;
        this.render(section, 'Narration finished. Play again whenever you like.');
      });
      audio.addEventListener('error', () => {
        const data = this.sections[section];
        if (data.voice.startsWith('sys_')) return;
        data.version += 1;
        data.state = 'stopped';
        this.render(section, 'This recording could not be loaded. Try another voice.');
      });
      this.render(section);
    });
    if (this.synth) {
      this.loadBrowserVoices();
      this.synth.addEventListener('voiceschanged', () => this.loadBrowserVoices());
    }
    window.addEventListener('pagehide', () => this.stopAll());
  }

  loadBrowserVoices() {
    // Preserve a selected voice's identity if the browser reports a new ordering.
    const previous = this.browserVoices;
    this.browserVoices = this.synth.getVoices().filter(voice => voice.lang.startsWith('en'));
    Object.entries(this.sections).forEach(([section, data]) => {
      const select = data.container.querySelector('.voice-select');
      const selected = data.voice.startsWith('sys_') ? previous[Number(data.voice.slice(4))]?.voiceURI : null;
      select.querySelector('optgroup')?.remove();
      if (this.browserVoices.length) {
        const group = document.createElement('optgroup');
        group.label = 'Browser voices Â· live speech';
        this.browserVoices.forEach((voice, index) => {
          const option = document.createElement('option');
          option.value = `sys_${index}`;
          option.textContent = `${voice.name} (${voice.lang})`;
          group.appendChild(option);
        });
        select.appendChild(group);
      }
      if (selected) {
        const nextIndex = this.browserVoices.findIndex(voice => voice.voiceURI === selected);
        if (nextIndex < 0) this.setVoice(section, 'christopher');
        else data.voice = `sys_${nextIndex}`;
      }
      select.value = data.voice;
    });
  }

  setVoice(section, value) {
    const data = this.sections[section];
    if (!data) return;
    this.stop(section);
    data.voice = value;
    data.container.querySelector('.voice-select').value = value;
    if (!value.startsWith('sys_')) {
      data.audio.src = `assets/audio/${section}_reflection_${value}.mp3`;
      data.audio.load();
    }
    this.render(section);
  }

  toggle(section) {
    const data = this.sections[section];
    if (!data || data.state === 'loading') return;
    Object.keys(this.sections).filter(other => other !== section).forEach(other => this.stop(other));
    if (data.voice.startsWith('sys_')) this.toggleSpeech(section);
    else this.toggleAudio(section);
  }

  async toggleAudio(section) {
    const data = this.sections[section];
    if (data.state === 'playing') {
      data.audio.pause();
      data.state = 'paused';
      this.render(section);
      return;
    }
    const version = ++data.version;
    data.state = 'loading';
    this.render(section);
    try {
      await data.audio.play();
      if (version !== data.version) return;
      data.state = 'playing';
      this.render(section);
    } catch {
      if (version !== data.version) return;
      data.state = 'stopped';
      this.render(section, 'Unable to play this recording. Try again or choose another voice.');
    }
  }

  toggleSpeech(section) {
    const data = this.sections[section];
    if (!this.synth) return;
    if (data.state === 'playing') {
      this.synth.pause();
      data.state = 'paused';
      this.render(section);
      return;
    }
    if (data.state === 'paused' && this.speechSection === section) {
      this.synth.resume();
      data.state = 'playing';
      this.render(section);
      return;
    }
    const script = data.container.closest('.reflection-unified-card').querySelector('.reflection-body-content').innerText.trim();
    const version = ++data.version;
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.voice = this.browserVoices[Number(data.voice.slice(4))];
    utterance.rate = .95;
    this.utterance = utterance;
    this.speechSection = section;
    data.state = 'loading';
    this.render(section);
    utterance.onstart = () => {
      if (version !== data.version) return;
      data.state = 'playing';
      this.render(section);
    };
    utterance.onend = () => {
      if (version !== data.version) return;
      data.state = 'stopped';
      this.speechSection = null;
      this.utterance = null;
      this.render(section, 'Narration finished.');
    };
    utterance.onerror = () => {
      if (version !== data.version) return;
      data.state = 'stopped';
      this.speechSection = null;
      this.utterance = null;
      this.render(section, 'This browser voice is unavailable. Choose a recorded voice.');
    };
    this.synth.cancel();
    this.synth.resume();
    this.synth.speak(utterance);
  }

  stop(section) {
    const data = this.sections[section];
    if (!data) return;
    data.version += 1;
    data.audio.pause();
    if (data.audio.readyState > 0) data.audio.currentTime = 0;
    if (this.speechSection === section) {
      this.speechSection = null;
      this.utterance = null;
      this.synth.cancel();
    }
    data.state = 'stopped';
    this.render(section);
  }

  stopAll() {
    Object.entries(this.sections).forEach(([section, data]) => {
      if (data.state !== 'stopped') this.stop(section);
    });
  }

  seek(section, percent) {
    const data = this.sections[section];
    if (!data.voice.startsWith('sys_') && Number.isFinite(data.audio.duration)) {
      data.audio.currentTime = Math.max(0, Math.min(100, percent)) / 100 * data.audio.duration;
      this.renderProgress(section);
    }
  }

  render(section, message) {
    const data = this.sections[section];
    const button = data.container.querySelector('.btn-ai-play');
    const active = data.state === 'playing';
    const label = data.state === 'loading' ? 'Loading' : active ? 'Pause' : data.state === 'paused' ? 'Resume' : 'Play';
    button.disabled = data.state === 'loading';
    button.setAttribute('aria-label', `${label} ${section} reflection`);
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('.btn-label').textContent = label;
    button.querySelector('.player-play-icon').textContent = active ? 'â…¡' : 'â–¶';
    const system = data.voice.startsWith('sys_');
    const name = data.container.querySelector('.voice-select').selectedOptions[0]?.textContent || 'Christopher';
    const status = data.container.querySelector('.player-status');
    const nextMessage = message || (data.state === 'loading' ? 'Preparing narrationâ€¦' : `${name} Â· ${system ? 'Live speech Â· seeking unavailable' : 'Recorded narration'}${data.state === 'paused' ? ' Â· Paused' : ''}`);
    if (status.textContent !== nextMessage) status.textContent = nextMessage;
    this.renderProgress(section);
  }

  renderProgress(section) {
    const data = this.sections[section];
    const system = data.voice.startsWith('sys_');
    const duration = data.audio.duration;
    const current = system ? 0 : data.audio.currentTime;
    const slider = data.container.querySelector('.ai-progress-slider');
    slider.disabled = system || !Number.isFinite(duration) || duration <= 0;
    slider.value = !system && duration > 0 ? current / duration * 100 : 0;
    slider.setAttribute('aria-valuetext', system ? 'Live browser narration' : `${this.formatTime(current)} of ${this.formatTime(duration)}`);
    data.container.querySelector('.ai-current-time').textContent = this.formatTime(current);
    data.container.querySelector('.ai-total-time').textContent = system ? 'Live' : this.formatTime(duration);
  }

  formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
}
window.aiNarrator = new AIReflectionNarrator();



