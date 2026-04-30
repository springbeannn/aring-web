'use client';

import { useEffect, useState } from 'react';
import AccordionMenuItem from './AccordionMenuItem';

const MENU_DATA = [
  { id: 'menu1', label: '메뉴 1', children: [{ id: 'menu1-1', label: '메뉴 1-1' }, { id: 'menu1-2', label: '메뉴 1-2' }] },
  { id: 'menu2', label: '메뉴 2', children: [{ id: 'menu2-1', label: '메뉴 2-1' }, { id: 'menu2-2', label: '메뉴 2-2' }] },
  { id: 'menu3', label: '메뉴 3', children: [{ id: 'menu3-1', label: '메뉴 3-1' }, { id: 'menu3-2', label: '메뉴 3-2' }] },
  { id: 'menu4', label: '메뉴 4', children: [{ id: 'menu4-1', label: '메뉴 4-1' }, { id: 'menu4-2', label: '메뉴 4-2' }] },
  { id: 'menu5', label: '메뉴 5', children: [{ id: 'menu5-1', label: '메뉴 5-1' }, { id: 'menu5-2', label: '메뉴 5-2' }] },
  ];

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => { if (!isOpen) setActiveMenuId(null); }, [isOpen]);

  useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleAccordion = (id: string) => setActiveMenuId((prev) => (prev === id ? null : id));

  return (
        <>
              <div
                        aria-hidden="true"
                        onClick={onClose}
                        style={{ transition: 'opacity 0.3s ease, visibility 0.3s ease' }}
                        className={`fixed inset-0 z-[9998] bg-[rgba(30,27,46,0.45)] backdrop-blur-[2px] ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                      />
              <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="메뉴"
                        style={{ transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)', boxShadow: '-8px 0 40px rgba(30,27,46,0.12)' }}
                        className={`fixed top-0 right-0 z-[9999] h-screen w-[min(88vw,420px)] bg-white flex flex-col rounded-l-[22px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                      >
                      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgb(229,229,229)] flex-shrink-0">
                                <div className="flex items-baseline gap-1">
                                            <span className="text-[22px] font-black tracking-tight text-aring-green leading-none">aring</span>span>
                                            <sup className="text-[10px] font-medium text-aring-ink-500">한 짝의 짝</sup>sup>
                                </div>div>
                                <button onClick={onClose} aria-label="메뉴 닫기" className="w-10 h-10 rounded-full bg-[rgb(243,243,245)] flex items-center justify-center text-aring-ink-900 hover:bg-[rgb(235,235,240)] active:scale-95 transition">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>svg>
                                </button>button>
                      </div>div>
                      <nav aria-label="사이트 메뉴" className="flex-1 overflow-y-auto overflow-x-hidden py-2 pb-8">
                        {MENU_DATA.map((item) => (
                                    <AccordionMenuItem key={item.id} id={item.id} label={item.label} children={item.children} isActive={activeMenuId === item.id} onToggle={toggleAccordion} />
                                  ))}
                      </nav>nav>
                      <div className="px-6 pt-4 pb-6 border-t border-[rgb(229,229,229)] flex-shrink-0">
                                <button className="w-full flex items-center justify-center gap-1.5 py-[14px] bg-aring-ink-900 text-white rounded-full text-[14px] font-extrabold hover:opacity-90 active:scale-[0.97] transition">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>svg>
                                            한 짝 등록하기
                                </button>button>
                      </div>div>
              </div>div>
        </>>
      );
}</>
