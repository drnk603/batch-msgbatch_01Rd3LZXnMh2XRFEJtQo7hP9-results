(function() {
  'use strict';

  const APP_STATE = {
    initialized: false,
    menuOpen: false,
    submitting: false
  };

  const CONSTANTS = {
    DEBOUNCE_DELAY: 150,
    NOTIFICATION_TIMEOUT: 5000,
    SUBMIT_DELAY: 1000
  };

  const REGEX = {
    email: /^[^s@]+@[^s@]+.[^s@]+$/,
    phone: /^[+-ds()[]]{8,20}$/,
    name: /^[a-zA-ZÀ-ÿs-']{2,50}$/
  };

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function sanitizeInput(value) {
    if (!value) return '';
    return String(value).trim();
  }

  function showNotification(message, type) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
      document.body.appendChild(container);
    }

    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : type === 'warning' ? 'alert-warning' : 'alert-info';
    const toast = document.createElement('div');
    toast.className = 'alert ' + alertClass + ' alert-dismissible fade show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 150);
    }, CONSTANTS.NOTIFICATION_TIMEOUT);
  }

  function validateField(field) {
    const value = sanitizeInput(field.value);
    const fieldType = field.type;
    const fieldId = field.id;
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    } else if (value) {
      if (fieldType === 'email' || fieldId === 'email') {
        if (!REGEX.email.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address.';
        }
      } else if (fieldType === 'tel' || fieldId === 'phone') {
        if (!REGEX.phone.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number (8-20 digits).';
        }
      } else if (fieldId === 'firstName' || fieldId === 'lastName') {
        if (!REGEX.name.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid name (2-50 characters, letters only).';
        }
      } else if (fieldId === 'message') {
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters long.';
        }
      }
    }

    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      isValid = false;
      errorMessage = 'You must accept this to continue.';
    }

    let feedback = field.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      field.parentElement.appendChild(feedback);
    }

    feedback.textContent = errorMessage;

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
    }

    return isValid;
  }

  function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function initBurgerMenu() {
    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!toggle || !collapse) return;

    function closeMenu() {
      APP_STATE.menuOpen = false;
      toggle.setAttribute('aria-expanded', 'false');
      collapse.classList.remove('show');
      body.classList.remove('u-no-scroll');
    }

    function openMenu() {
      APP_STATE.menuOpen = true;
      toggle.setAttribute('aria-expanded', 'true');
      collapse.classList.add('show');
      body.classList.add('u-no-scroll');
    }

    toggle.addEventListener('click', e => {
      e.preventDefault();
      if (APP_STATE.menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (APP_STATE.menuOpen) {
          closeMenu();
        }
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && APP_STATE.menuOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', e => {
      if (APP_STATE.menuOpen && !toggle.contains(e.target) && !collapse.contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 768 && APP_STATE.menuOpen) {
        closeMenu();
      }
    }, CONSTANTS.DEBOUNCE_DELAY));
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;

        const targetId = href.replace('#', '');
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        const header = document.querySelector('.l-header');
        const headerHeight = header ? header.offsetHeight : 72;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  function initActiveMenu() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      let isActive = false;
      if (linkPath === '/index.html' || linkPath === '/') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/')) {
          isActive = true;
        }
      } else {
        if (currentPath.indexOf(linkPath) === 0) {
          isActive = true;
        }
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  }

  function initForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      const fields = form.querySelectorAll('.form-control, .form-select, .form-check-input');
      
      fields.forEach(field => {
        field.addEventListener('blur', () => {
          if (field.value || field.checked) {
            validateField(field);
          }
        });

        field.addEventListener('input', () => {
          if (field.classList.contains('is-invalid') || field.classList.contains('is-valid')) {
            validateField(field);
          }
        });
      });

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        form.classList.add('was-validated');

        if (!validateForm(form)) {
          showNotification('Please fill in all required fields correctly.', 'error');
          return;
        }

        if (APP_STATE.submitting) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.innerHTML : '';

        APP_STATE.submitting = true;

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
        }

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
          jsonData[key] = sanitizeInput(value);
        });

        setTimeout(() => {
          showNotification('Thank you! Your message has been sent successfully.', 'success');
          
          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);

          form.reset();
          form.classList.remove('was-validated');
          
          fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
          });

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
          }

          APP_STATE.submitting = false;
        }, CONSTANTS.SUBMIT_DELAY);
      });
    });
  }

  function initAccordions() {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const target = this.getAttribute('data-bs-target');
        if (!target) return;

        const collapse = document.querySelector(target);
        if (!collapse) return;

        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          this.classList.add('collapsed');
          collapse.classList.remove('show');
        } else {
          this.setAttribute('aria-expanded', 'true');
          this.classList.remove('collapsed');
          collapse.classList.add('show');
        }
      });
    });
  }

  function initFAQSearch() {
    const searchInput = document.getElementById('faqSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function() {
      const query = this.value.toLowerCase();
      const accordionItems = document.querySelectorAll('.accordion-item');

      accordionItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.indexOf(query) !== -1) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }, 300));
  }

  function initImageLazyLoad() {
    const images = document.querySelectorAll('img:not([loading])');
    
    images.forEach(img => {
      const isCritical = img.hasAttribute('data-critical');
      const isLogo = img.closest('.navbar-brand') || img.classList.contains('c-logo__img');
      
      if (!isCritical && !isLogo) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function() {
        const fallback = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="#e9ecef"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#6c757d">Image not available</text></svg>';
        this.src = 'data:image/svg+xml;base64,' + btoa(fallback);
      });
    });
  }

  function init() {
    if (APP_STATE.initialized) return;
    APP_STATE.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initActiveMenu();
    initForms();
    initAccordions();
    initFAQSearch();
    initImageLazyLoad();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
