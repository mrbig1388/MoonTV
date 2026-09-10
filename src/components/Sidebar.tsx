'use client';

import { ChevronUp, Clover, Film, Home, Search, Tv } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { useSite } from './SiteProvider';

interface SidebarContextType {
  isCollapsed: boolean;
}

// 1. Context 默认值改为 true (默认折叠/隐藏)
const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: true,
});

export const useSidebar = () => useContext(SidebarContext);

// 提取的 Logo 组件，调整为水平布局自适应
const Logo = () => {
  const { siteName } = useSite();
  return (
    <Link
      href='/'
      className='flex items-center justify-center h-full select-none hover:opacity-80 transition-opacity duration-200'
    >
      <span className='text-xl font-bold text-green-600 tracking-tight whitespace-nowrap'>
        {siteName}
      </span>
    </Link>
  );
};

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  activePath?: string;
}

declare global {
  interface Window {
    __sidebarCollapsed?: boolean;
  }
}

const Sidebar = ({ onToggle, activePath = '/' }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 初始化状态：默认为 true (收起状态)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.__sidebarCollapsed === 'boolean'
    ) {
      return window.__sidebarCollapsed;
    }
    return true; // 默认收起
  });

  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      const val = JSON.parse(saved);
      setIsCollapsed(val);
      window.__sidebarCollapsed = val;
    } else {
      // 首次加载主动写入收起状态
      localStorage.setItem('sidebarCollapsed', JSON.stringify(true));
      window.__sidebarCollapsed = true;
    }
  }, []);

  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCollapsed) {
        document.documentElement.dataset.sidebarCollapsed = 'true';
      } else {
        delete document.documentElement.dataset.sidebarCollapsed;
      }
    }
  }, [isCollapsed]);

  const [active, setActive] = useState(activePath);

  useEffect(() => {
    if (activePath) {
      setActive(activePath);
    } else {
      const getCurrentFullPath = () => {
        const queryString = searchParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      };
      const fullPath = getCurrentFullPath();
      setActive(fullPath);
    }
  }, [activePath, pathname, searchParams]);

  const handleToggle = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    if (typeof window !== 'undefined') {
      window.__sidebarCollapsed = newState;
    }
    onToggle?.(newState);
  }, [isCollapsed, onToggle]);

  const handleSearchClick = useCallback(() => {
    router.push('/search');
  }, [router]);

  const contextValue = {
    isCollapsed,
  };

  const menuItems = [
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

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className='hidden md:block'>
        {/* 侧边栏改为固定在底部的水平栏 */}
        <aside
          data-sidebar
          className={`fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-xl transition-transform duration-300 ease-in-out border-t border-gray-200/50 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:bg-gray-900/90 dark:border-gray-700/50 ${
            isCollapsed ? 'translate-y-full' : 'translate-y-0'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* 展开/收起 居中把手按钮 */}
          <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex justify-center pointer-events-none'>
            <button
              onClick={handleToggle}
              className='pointer-events-auto flex items-center justify-center gap-1.5 px-5 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-t-xl border-t border-x border-gray-200/60 dark:border-gray-700/60 shadow-sm text-gray-500 hover:text-green-600 transition-colors dark:text-gray-400 dark:hover:text-green-400 text-xs font-medium'
            >
              <span>{isCollapsed ? '展开导航' : '收起导航'}</span>
              <ChevronUp
                className={`h-4 w-4 transition-transform duration-300 ${
                  isCollapsed ? '' : 'rotate-180'
                }`}
              />
            </button>
          </div>

          {/* 底部栏主体内容：水平排列 */}
          <div className='flex h-16 items-center px-6 justify-between max-w-screen-2xl mx-auto'>
            {/* 左侧 Logo */}
            <div className='flex-shrink-0 mr-8'>
              <Logo />
            </div>

            {/* 右侧导航项 */}
            <nav className='flex flex-1 items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar'>
              <Link
                href='/'
                onClick={() => setActive('/')}
                data-active={active === '/'}
                className='group flex items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/50 hover:text-green-600 data-[active=true]:bg-green-500/10 data-[active=true]:text-green-700 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-green-400 dark:data-[active=true]:bg-green-500/10 dark:data-[active=true]:text-green-400 gap-2 flex-shrink-0'
              >
                <Home className='h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700 dark:text-gray-400 dark:group-hover:text-green-400 dark:data-[active=true]:text-green-400' />
                <span>首页</span>
              </Link>
              
              <Link
                href='/search'
                onClick={(e) => {
                  e.preventDefault();
                  handleSearchClick();
                  setActive('/search');
                }}
                data-active={active === '/search'}
                className='group flex items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/50 hover:text-green-600 data-[active=true]:bg-green-500/10 data-[active=true]:text-green-700 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-green-400 dark:data-[active=true]:bg-green-500/10 dark:data-[active=true]:text-green-400 gap-2 flex-shrink-0'
              >
                <Search className='h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700 dark:text-gray-400 dark:group-hover:text-green-400 dark:data-[active=true]:text-green-400' />
                <span>搜索</span>
              </Link>

              {/* 视觉分隔线 */}
              <div className='w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1 flex-shrink-0'></div>

              {menuItems.map((item) => {
                const typeMatch = item.href.match(/type=([^&]+)/)?.[1];
                const tagMatch = item.href.match(/tag=([^&]+)/)?.[1];

                const decodedActive = decodeURIComponent(active);
                const decodedItemHref = decodeURIComponent(item.href);

                const isActive =
                  decodedActive === decodedItemHref ||
                  (decodedActive.startsWith('/douban') &&
                    decodedActive.includes(`type=${typeMatch}`) &&
                    tagMatch &&
                    decodedActive.includes(`tag=${tagMatch}`));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setActive(item.href)}
                    data-active={isActive}
                    className='group flex items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/50 hover:text-green-600 data-[active=true]:bg-green-500/10 data-[active=true]:text-green-700 font-medium transition-colors duration-200 dark:text-gray-300 dark:hover:text-green-400 dark:data-[active=true]:bg-green-500/10 dark:data-[active=true]:text-green-400 gap-2 flex-shrink-0'
                  >
                    <Icon className='h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700 dark:text-gray-400 dark:group-hover:text-green-400 dark:data-[active=true]:text-green-400' />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 宽度置为 0，防止撑开 PageLayout 中原本给侧边栏预留的网格（Grid）列宽，实现全屏居中 */}
        <div className='w-0 h-0 hidden sidebar-offset'></div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
