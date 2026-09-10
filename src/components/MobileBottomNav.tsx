'use client';

import { useState } from 'react';
import { ChevronUp, Clover, Film, Home, Search, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileBottomNavProps {
  /**
   * 主动指定当前激活的路径。当未提供时，自动使用 usePathname() 获取的路径。
   */
  activePath?: string;
}

const MobileBottomNav = ({ activePath }: MobileBottomNavProps) => {
  const pathname = usePathname();
  // 默认为收起状态
  const [isExpanded, setIsExpanded] = useState(false);

  // 当前激活路径：优先使用传入的 activePath，否则回退到浏览器地址
  const currentActive = activePath ?? pathname;

  const navItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: Search, label: '搜索', href: '/search' },
    {
      icon: Film,
      label: '电影',
      href: '/douban?type=movie',
    },
    {
      icon: Tv,
      label: '剧集',
      href: '/douban?type=tv',
    },
    {
      icon: Clover,
      label: '综艺',
      href: '/douban?type=show',
    },
  ];

  const isActive = (href: string) => {
    const typeMatch = href.match(/type=([^&]+)/)?.[1];

    // 解码URL以进行正确的比较
    const decodedActive = decodeURIComponent(currentActive);
    const decodedItemHref = decodeURIComponent(href);

    return (
      decodedActive === decodedItemHref ||
      (decodedActive.startsWith('/douban') &&
        decodedActive.includes(`type=${typeMatch}`))
    );
  };

  return (
    <div
      className={`fixed left-0 right-0 z-[600] transition-transform duration-300 ease-in-out ${
        isExpanded ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        bottom: 0,
      }}
    >
      {/* 收起/展开 控制按钮：始终悬浮在导航栏上方 */}
      <div className='flex justify-center -translate-y-full absolute top-0 left-0 right-0 pointer-events-none'>
        <button
          type='button'
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? '收起菜单' : '展开菜单'}
          className='pointer-events-auto flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-t-xl border-t border-x border-gray-200/60 dark:border-gray-700/60 shadow-md hover:text-green-600 transition-colors'
        >
          <span>{isExpanded ? '收起' : '菜单'}</span>
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* 底部横向菜单主体 */}
      <nav
        className='bg-white/90 backdrop-blur-xl border-t border-gray-200/50 overflow-hidden dark:bg-gray-900/80 dark:border-gray-700/50 shadow-lg'
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <ul className='flex items-center'>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className='flex-shrink-0 w-1/5'>
                <Link
                  href={item.href}
                  className='flex flex-col items-center justify-center w-full h-14 gap-1 text-xs'
                >
                  <item.icon
                    className={`h-6 w-6 ${
                      active
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
                  <span
                    className={
                      active
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
