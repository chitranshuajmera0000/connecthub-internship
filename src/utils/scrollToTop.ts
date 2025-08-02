export const scrollToTop = (behavior: 'auto' | 'smooth' = 'auto') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

export const useScrollToTop = () => {
  return {
    scrollToTop: (smooth: boolean = false) => {
      scrollToTop(smooth ? 'smooth' : 'auto');
    }
  };
};
