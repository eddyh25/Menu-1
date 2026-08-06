/**
 * Card Navigation Component
 * Vanilla JavaScript implementation with GSAP animations
 */

class CardNavigation {
  constructor() {
    // DOM elements
    this.nav = document.getElementById('cardNav');
    this.hamburger = document.getElementById('hamburgerMenu');
    this.content = document.getElementById('cardNavContent');
    this.stickyHeader = document.getElementById('stickyHeader');
    this.cards = null;
    
    // State
    this.isOpen = false;
    this.timeline = null;
    this.scrollThreshold = 100;
    
    // Initialize if elements exist
    if (this.nav && this.hamburger && this.content) {
      this.init();
    }
  }
  
  init() {
    this.cards = this.nav.querySelectorAll('.nav-card');
    this.highlightActiveCard();
    this.createTimeline();
    this.attachEventListeners();
    this.initScrollListener();
  }
  
  /**
   * Shade the dropdown button that matches the currently open page.
   * Menu section pages (beverages/dessert) count as the "Menu" card.
   */
  highlightActiveCard() {
    if (!this.cards || this.cards.length === 0) return;
    
    const fileName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const targetHref = {
      'index.html': 'index.html',
      'food.html': 'food.html',
      'beverages.html': 'food.html',
      'dessert.html': 'food.html',
      'feedback.html': 'feedback.html',
      'about.html': 'about.html'
    }[fileName] || fileName;
    
    this.cards.forEach(card => {
      const link = card.querySelector('.nav-card-link');
      if (link && link.getAttribute('href') === targetHref) {
        card.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }
  
  calculateHeight() {
    const navEl = this.nav;
    if (!navEl) return 200;
    
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // Mobile: 4 cards in 2x2 grid
      // Top bar (60px) + 2 rows of cards (~50px each) + padding
      return 60 + (50 * 2) + 24;
    } else {
      // Desktop: 4 cards in a row
      // Top bar (60px) + card height (~60px) + padding
      return 60 + 60 + 24;
    }
  }
  
  createTimeline() {
    if (!this.nav || !this.cards || this.cards.length === 0) return;
    
    // Kill existing timeline if any
    if (this.timeline) {
      this.timeline.kill();
    }
    
    // Set initial states
    gsap.set(this.nav, { height: 60, overflow: 'hidden' });
    gsap.set(this.cards, { y: 30, opacity: 0 });
    
    // Create new timeline
    this.timeline = gsap.timeline({ paused: true });
    
    // Expand height animation
    this.timeline.to(this.nav, {
      height: this.calculateHeight(),
      duration: 0.4,
      ease: 'power3.out'
    });
    
    // Animate cards with stagger (left to right)
    this.timeline.to(this.cards, {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: 'power3.out',
      stagger: 0.08
    }, '-=0.1');
  }
  
  toggleMenu() {
    if (!this.timeline) return;
    
    if (!this.isOpen) {
      // Open menu
      this.isOpen = true;
      this.hamburger.classList.add('open');
      this.nav.classList.add('open');
      this.hamburger.setAttribute('aria-expanded', 'true');
      this.content.setAttribute('aria-hidden', 'false');
      this.timeline.play();
    } else {
      // Close menu
      this.isOpen = false;
      this.hamburger.classList.remove('open');
      this.nav.classList.remove('open');
      this.hamburger.setAttribute('aria-expanded', 'false');
      this.content.setAttribute('aria-hidden', 'true');
      this.timeline.reverse();
    }
  }
  
  handleResize() {
    if (!this.timeline) return;
    
    // Recalculate height and update timeline
    const newHeight = this.calculateHeight();
    
    if (this.isOpen) {
      // If menu is open, update height immediately
      gsap.set(this.nav, { height: newHeight });
    }
    
    // Recreate timeline with new height
    this.createTimeline();
    
    // If menu was open, set timeline to end state
    if (this.isOpen) {
      this.timeline.progress(1);
    }
  }
  
  initScrollListener() {
    if (!this.stickyHeader) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > this.scrollThreshold) {
        this.stickyHeader.classList.add('visible');
      } else {
        this.stickyHeader.classList.remove('visible');
        // Close menu when header hides
        if (this.isOpen) {
          this.toggleMenu();
        }
      }
      
      lastScrollTop = scrollTop;
    });
  }
  
  closeOnClickOutside(event) {
    if (!this.isOpen) return;
    
    // Check if click is outside the nav element
    if (this.nav && !this.nav.contains(event.target)) {
      this.toggleMenu();
    }
  }
  
  handleKeyPress(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleMenu();
    }
  }
  
  attachEventListeners() {
    // Hamburger click
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMenu());
      this.hamburger.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    // Window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.handleResize(), 250);
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => this.closeOnClickOutside(e));
    
    // Close menu when clicking a link
    if (this.cards) {
      this.cards.forEach(card => {
        const link = card.querySelector('.nav-card-link');
        if (link) {
          link.addEventListener('click', () => {
            if (this.isOpen) {
              this.toggleMenu();
            }
          });
        }
      });
    }
  }
}

// Initialize when DOM is ready
if (typeof gsap !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new CardNavigation();
  });
} else {
  console.error('GSAP library not loaded. Card navigation requires GSAP.');
}
