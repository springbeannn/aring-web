'use client';

interface SubMenuItem {
    id: string;
    label: string;
}

interface AccordionMenuItemProps {
    id: string;
    label: string;
    children: SubMenuItem[];
    isActive: boolean;
    onToggle: (id: string) => void;
}

export default function AccordionMenuItem({
    id,
    label,
    children,
    isActive,
    onToggle,
}: AccordionMenuItemProps) {
    return (
          <div
                  className="border-b border-[rgb(243,243,245)] last:border-none"
                  data-active={isActive}
                >
                <button
                          onClick={() => onToggle(id)}
                          aria-expanded={isActive}
                          aria-controls={`submenu-${id}`}
                          className="relative w-full flex items-center justify-between px-6 py-[18px] bg-transparent hover:bg-[rgb(243,243,245)] active:bg-[rgb(238,238,242)] transition-colors text-left"
                        >
                  {/* active 좌측 인디케이터 */}
                        <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-aring-accent transition-all duration-250"
                                    style={{
                                                  height: isActive ? '60%' : '0',
                                                  opacity: isActive ? 1 : 0,
                                    }}
                                  />
                        <span
                                    className={`text-[15px] font-bold transition-colors ${
                                                  isActive ? 'text-aring-green' : 'text-aring-ink-900'
                                    }`}
                                  >
                          {label}
                        </span>span>
                        <svg
                                    className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-[250ms] ${
                                                  isActive ? 'text-aring-green rotate-180' : 'text-aring-ink-500'
                                    }`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                  <polyline points="6 9 12 15 18 9" />
                        </svg>svg>
                </button>button>
          
            {/* 2depth 서브메뉴 */}
                <div
                          id={`submenu-${id}`}
                          role="region"
                          className="overflow-hidden transition-all duration-300 bg-[rgb(248,248,250)]"
                          style={{ maxHeight: isActive ? `${children.length * 52}px` : '0' }}
                        >
                        <div className="py-[6px]">
                          {children.map((child) => (
                                      <button
                                                      key={child.id}
                                                      className="w-full flex items-center gap-2 pl-11 pr-6 py-[13px] text-[13.5px] font-medium text-aring-ink-500 hover:text-aring-ink-700 hover:bg-[rgb(243,243,245)] active:bg-[rgb(238,238,242)] transition-colors text-left"
                                                    >
                                                    <span className="w-1 h-1 rounded-full bg-aring-accent flex-shrink-0" />
                                        {child.label}
                                      </button>button>
                                    ))}
                        </div>div>
                </div>div>
          </div>div>
        );
}</div>
