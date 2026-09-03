// Make ScrollTrigger available for use in GSAP animations
gsap.registerPlugin(ScrollTrigger);

// Select the HTML elements needed for the animation
const scrollSection = document.querySelectorAll(".scroll-section");

scrollSection.forEach((section) => {
  const wrapper = section.querySelector(".wrapper");
  const items = wrapper.querySelectorAll(".item");

  // Initialize
  let direction = null;

  if (section.classList.contains("vertical-section")) {
    direction = "vertical";
  } else if (section.classList.contains("horizontal-section")) {
    direction = "horizontal";
  }

  initScroll(section, items, direction);
});

function initScroll(section, items, direction) {
  // Initial states: Push all slides (except the first) 100% to the right/bottom
  items.forEach((item, index) => {
    if (index !== 0) {
      direction == "horizontal"
        ? gsap.set(item, { xPercent: 100 })
        : gsap.set(item, { yPercent: 100 });
    }
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      pin: true,
      start: "top top",
      end: () => `+=${items.length * 100}%`,

      // CHANGED: Increased scrub to 2.5 for smoother/slower feel
      scrub: 3.5,

      invalidateOnRefresh: true,
    },
    defaults: { ease: "none" },
  });

  // --- 1. First Slide Text Animation ---
  const firstSlideTriggers = items[0].querySelectorAll(
    "[class*='triggerSpan']"
  );
  if (firstSlideTriggers.length > 0) {
    timeline.to(
      firstSlideTriggers,
      {
        backgroundSize: "100% 100%",
        duration: 0.1, // Faster duration ensures it fills fully
        ease: "power1.out",
      },
      0
    );
  }

  // --- 2. Loop through remaining slides ---
  items.forEach((item, index) => {
    // Scale down the CURRENT item
    timeline.to(item, {
      scale: 0.8,
      borderRadius: "10px",
      duration: 1, // Standard duration for slide movement
    });

    // Move the NEXT item in
    if (items[index + 1]) {
      const nextItem = items[index + 1];

      timeline.to(
        nextItem,
        {
          [direction === "horizontal" ? "xPercent" : "yPercent"]: 0,
        },
        "<" // Sync exactly with the previous slide scaling down
      );

      // --- 3. Animate Text inside the NEXT item ---
      const nextTriggers = nextItem.querySelectorAll("[class*='triggerSpan']");

      if (nextTriggers.length > 0) {
        timeline.to(
          nextTriggers,
          {
            backgroundSize: "100% 100%", // The Wipe Effect

            // CRITICAL FIX:
            // Reduced duration (0.5) means it finishes filling much faster.
            // This prevents it from getting stuck "halfway" if you scroll fast.
            duration: 0.5,

            stagger: 0.1,
            ease: "power1.inOut", // Adds a nice slow-start/slow-end feel
          },
          "<1%" // Starts slightly after the slide begins moving in (10%)
        );
      }
    }
  });
}

// ——————————————————————————————————————————————————
// TextScramble (No Changes)
// ——————————————————————————————————————————————————

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ——————————————————————————————————————————————————
// Example & Effects
// ——————————————————————————————————————————————————

const phrases = ["Hello,Welcome to", "Quizora"];

const el = document.querySelector(".text");
if (el) {
  const fx = new TextScramble(el);
  let counter = 0;
  const next = () => {
    fx.setText(phrases[counter]).then(() => {
      setTimeout(next, 1200);
    });
    counter = (counter + 1) % phrases.length;
  };
  next();
}

// Mouse Follower
Shery.mouseFollower();
