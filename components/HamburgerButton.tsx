'use client';

interface HamburgerButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
    return (
          <button
                  aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
                  aria-expanded={isOpen}
                  onClick={onClick}
                  className="relative w-10 h-10 rounded-full bg-aring-ink-100 flex items-center justify-center text-aring-ink-900 active:scale-95 transition"
                >
                <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                  <line
                                                x1="4" y1="6" x2="16" y2="6"
                                                style={{
                                                                transformOrigin: 'center 6px',
                                                                transform: isOpen ? 'translateY(4px) rotate(45deg)' : 'none',
                                                                transition: 'transform 0.25s ease',
                                                }}
                                              />
                                  <line
                                                x1="4" y1="10" x2="16" y2="10"
                                                style={{
                                                                opacity: isOpen ? 0 : 1,
                                                                transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
                                                                transformOrigin: 'center',
                                                                transition: 'transform 0.25s ease, opacity 0.2s ease',
                                                }}
                                              />
                                  <line
                                                x1="4" y1="14" x2="16" y2="14"
                                                style={{
                                                                transformOrigin: 'center 14px',
                                                                transform: isOpen ? 'translateY(-4px) rotate(-45deg)' : 'none',
                                                                transition: 'transform 0.25s ease',
                                                }}
                                              />
                        </g>g>
                </svg>svg>
          </button>button>
        );
}</button>
