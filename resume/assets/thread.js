(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const instrument = document.querySelector('.thread-instrument');
    if (!instrument) return;
    const track = instrument.querySelector('.thread-track');
    const knob = instrument.querySelector('.thread-knob');
    const line = instrument.querySelector('.thread-line');
    const choices = [...instrument.querySelectorAll('[data-view]')];
    const states = ['research', 'about', 'work'];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = value => Math.max(0, Math.min(1, value));
    let selected = 1;
    let position = .5;
    let target = .5;
    let velocity = 0;
    let frame = 0;
    let previousTime = 0;
    let drag = null;
    let fade;
    let invitation;
    const views = states.map(state => document.getElementById(`view-${state}`));
    function checkReadingSpace() {
      if (document.body.classList.contains('home-reflow')) return;
      if (parseFloat(getComputedStyle(document.documentElement).fontSize) >= 24) {
        document.body.classList.add('home-reflow');
        cancelInvitation();
        return;
      }
      const view = views.find(panel => !panel.hidden);
      const action = view.querySelector('.view-link').getBoundingClientRect();
      const blocks = [...view.querySelectorAll('p,h2,li')].filter(node => node.getClientRects().length);
      const identity = document.querySelector('.index-identity');
      const crowdedIdentity = matchMedia('(max-width:650px)').matches && [...identity.children]
        .filter(node => node.getClientRects().length)
        .some(node => node.getBoundingClientRect().bottom > track.getBoundingClientRect().top + 1);
      if (crowdedIdentity || blocks.some(node => node.getBoundingClientRect().bottom > action.top + 1)) {
        document.body.classList.add('home-reflow');
        cancelInvitation();
      }
    }
    const dot = knob.querySelector('.knob-dot');
    function cancelInvitation() {
      invitation?.cancel();
      invitation = null;
    }

    function render() {
      const x = 24 + position * 392;
      knob.style.left = `${x / 440 * 100}%`;
      const bend = motion.matches ? 0 : Math.max(-8, Math.min(8, velocity * 5)) + (drag ? 6 : 0);
      line.setAttribute('d', `M24 54 C${(24+x)/2} 54 ${x-24} ${54+bend} ${x} 54 C${x+24} ${54-bend} ${(x+416)/2} 54 416 54`);
    }
    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }
    function step(time) {
      const dt = previousTime ? Math.min((time - previousTime) / 1000, .032) : 1 / 60;
      previousTime = time;
      velocity += ((target - position) * 240 - velocity * 25) * dt;
      position += velocity * dt;
      // Endpoint stops keep the moving object inside its own control.
      if (position < 0 || position > 1) {
        position = clamp(position);
        velocity *= -.18;
      }
      if (Math.abs(target - position) < .0005 && Math.abs(velocity) < .005) {
        position = target;
        velocity = 0;
        render();
        frame = 0;
        previousTime = 0;
        return;
      }
      render();
      frame = requestAnimationFrame(step);
    }
    function settle(animate) {
      stop();
      if (!animate || motion.matches || document.hidden) {
        position = target;
        velocity = 0;
        render();
      } else frame = requestAnimationFrame(step);
    }
    function choose(index, animate = false, historyEntry = false) {
      const changed = selected !== index;
      const focusedPanel = document.activeElement?.closest('.index-view');
      selected = index;
      target = index / 2;
      fade?.cancel();
      for (const button of choices) {
        const active = button.dataset.view === states[index];
        button.setAttribute('aria-pressed', String(active));
        document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
      }
      knob.setAttribute('aria-valuenow', String(index));
      knob.setAttribute('aria-valuetext', choices.find(button => button.dataset.view === states[index]).querySelector('.choice-label').textContent);
      if (historyEntry && location.hash !== `#${states[index]}`) history.pushState(null, '', `#${states[index]}`);
      if (changed) {
        document.dispatchEvent(new Event('index-view-change'));
        const panel = document.getElementById(`view-${states[index]}`);
        if (animate && !motion.matches) fade = panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'cubic-bezier(.23,1,.32,1)' });
        if (focusedPanel?.hidden) knob.focus({ preventScroll: true });
      }
      settle(animate);
    }
    function coordinate(clientX) {
      const bounds = track.getBoundingClientRect();
      return ((clientX - bounds.left) / bounds.width * 440 - 24) / 392;
    }
    function release(cancelled = false) {
      if (!drag) return;
      const pointer = drag.id;
      drag = null;
      instrument.classList.remove('is-dragging');
      const projected = clamp(position + Math.max(-2, Math.min(2, velocity)) * .1);
      const next = cancelled ? selected : Math.round(projected * 2);
      if (knob.hasPointerCapture(pointer)) knob.releasePointerCapture(pointer);
      choose(next, true, !cancelled);
    }
    knob.addEventListener('pointerdown', event => {
      if (drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault();
      stop();
      knob.focus({ preventScroll: true });
      drag = { id: event.pointerId, offset: coordinate(event.clientX) - position, time: event.timeStamp };
      velocity = 0;
      instrument.classList.add('is-dragging');
      knob.setPointerCapture(event.pointerId);
      render();
    });
    knob.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const next = clamp(coordinate(event.clientX) - drag.offset);
      const dt = Math.max(8, event.timeStamp - drag.time) / 1000;
      velocity = velocity * .6 + (next - position) / dt * .4;
      position = next;
      drag.time = event.timeStamp;
      render();
    });
    knob.addEventListener('pointerup', event => {
      if (drag?.id !== event.pointerId) return;
      if (event.timeStamp - drag.time > 80) velocity = 0;
      release();
    });
    knob.addEventListener('pointercancel', event => { if (drag?.id === event.pointerId) release(true); });
    knob.addEventListener('lostpointercapture', event => { if (drag?.id === event.pointerId) release(true); });
    knob.addEventListener('keydown', event => {
      const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key];
      if (direction || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : Math.max(0, Math.min(2, selected + direction));
        if (drag) release(true);
        choose(next, false, true);
      }
    });
    for (const button of choices) button.addEventListener('click', event => {
      if (drag) release(true);
      choose(states.indexOf(button.dataset.view), event.detail > 0, true);
    });
    track.addEventListener('click', event => {
      if (event.target.closest('.thread-knob') || drag) return;
      choose(Math.round(clamp(coordinate(event.clientX)) * 2), event.detail > 0, true);
    });
    const fromHash = () => {
      if (drag) release(true);
      const index = states.indexOf(location.hash.slice(1));
      choose(index < 0 ? (location.hash ? selected : 1) : index);
    };
    window.addEventListener('hashchange', fromHash);
    window.addEventListener('resize', () => {
      cancelInvitation();
      if (drag) release(true);
      settle(false);
      document.body.classList.remove('home-reflow');
      checkReadingSpace();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      cancelInvitation();
      if (drag) release(true);
      stop();
      position = target;
      velocity = 0;
      render();
    });
    motion.addEventListener('change', () => {
      if (motion.matches) { cancelInvitation(); fade?.cancel(); settle(false); }
    });
    instrument.hidden = false;
    instrument.parentElement.classList.add('index-ready');
    document.querySelector('.index-fallback').hidden = true;
    fromHash();
    if (window.ResizeObserver) {
      const readingObserver = new ResizeObserver(checkReadingSpace);
      views.forEach(view => readingObserver.observe(view));
      readingObserver.observe(document.querySelector('.index-identity'));
    }
    document.addEventListener('index-view-change', checkReadingSpace);
    document.addEventListener('pointerdown', cancelInvitation, {once:true, capture:true});
    document.addEventListener('focusin', cancelInvitation, {once:true, capture:true});
    document.addEventListener('keydown', cancelInvitation, {once:true, capture:true});
    if (!motion.matches && !document.hidden && dot.animate) {
      invitation = dot.animate([
        {transform:'translateX(0)',offset:0},
        {transform:'translateX(8px)',offset:.25},
        {transform:'translateX(-6px)',offset:.55},
        {transform:'translateX(2px)',offset:.8},
        {transform:'translateX(0)',offset:1}
      ], {duration:900,delay:450,iterations:1,easing:'cubic-bezier(.4,0,.2,1)'});
      invitation.onfinish = () => { invitation = null; };
    }
  });
})();
