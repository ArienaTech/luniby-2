// Essential Utility Functions for Veterinarian Portal

import type { Patient } from '../types';

// Mobile Utilities
export const mobileUtils = {
  isMobile: () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  scrollToTop: (smooth: boolean = true) => {
    if (mobileUtils.isMobile()) {
      window.scrollTo({ 
        top: 0, 
        behavior: smooth ? 'smooth' : 'auto' 
      });
      
      // Also scroll main content areas
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTo({ 
          top: 0, 
          behavior: smooth ? 'smooth' : 'auto' 
        });
      }

      // Scroll any scrollable containers
      const scrollableContainers = document.querySelectorAll('.overflow-auto, .overflow-y-auto');
      scrollableContainers.forEach(container => {
        container.scrollTo({ 
          top: 0, 
          behavior: smooth ? 'smooth' : 'auto' 
        });
      });
    }
  },

  // Enhanced scroll to top for navigation changes
  scrollToTopOnNavigate: () => {
    // Immediate scroll for better UX on mobile
    mobileUtils.scrollToTop(false);
    // Then smooth scroll for visual feedback
    setTimeout(() => mobileUtils.scrollToTop(true), 50);
  }
};

// Date Utilities
export const dateUtils = {
  formatDate: (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  },

  formatDateTime: (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// String Utilities
export const stringUtils = {
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str: string, maxLength: number = 50) => {
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  }
};

// Search Utilities
export const searchUtils = {
  filterPatients: (patients: Patient[], searchTerm: string) => {
    if (!searchTerm) return patients;
    
    const term = searchTerm.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(term) ||
      patient.owner_name.toLowerCase().includes(term) ||
      patient.species.toLowerCase().includes(term) ||
      (patient.breed && patient.breed.toLowerCase().includes(term))
    );
  }
};