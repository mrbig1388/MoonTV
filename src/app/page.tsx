/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, no-console */
'use client';

import { Suspense, useEffect, useState } from 'react';
import { 
  getAllFavorites, 
  getAllPlayRecords, 
  subscribeToDataUpdates,
  clearAllFavorites 
} from '@/lib/db.client';
import CapsuleSwitch from '@/components/CapsuleSwitch';
import ContinueWatching from '@/components/ContinueWatching';
import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';
import { useSite } from '@/components/SiteProvider';

// 假设这些是新增或已有的搜索/侧边栏相关组件
// 如果你的项目结构不同，请根据实际路径调整
import SearchBarWithHistory from '@/components/SearchBarWithHistory'; 

function HomeClient() {
  const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const { announcement } = useSite();
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // 公告逻辑保留
  useEffect(() => {
    if (typeof window !== 'undefined' && announcement) {
      const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement');
      if (hasSeenAnnouncement !== announcement) {
        setShowAnnouncement(true);
      }
    }
  }, [announcement]);

  // 获取收藏夹数据逻辑
  const updateFavoriteItems = async (allFavorites: Record<string, any>) => {
    const allPlayRecords = await getAllPlayRecords();
    const sorted = Object.entries(allFavorites)
      .sort(([, a], [, b]) => b.save_time - a.save_time)
      .map(([key, fav]) => {
        const plusIndex = key.indexOf('+');
        return {
          id: key.slice(plusIndex + 1),
          source: key.slice(0, plusIndex),
          title: fav.title,
          poster: fav.cover,
          episodes: fav.total_episodes,
          source_name: fav.source_name,
          currentEpisode: allPlayRecords[key]?.index,
          search_title: fav?.search_title,
        };
      });
    setFavoriteItems(sorted);
  };

  useEffect(() => {
    if (activeTab === 'favorites') {
      getAllFavorites().then(updateFavoriteItems);
      return subscribeToDataUpdates('favoritesUpdated', updateFavoriteItems);
    }
  }, [activeTab]);

  return (
    <PageLayout> 
      {/* 注意：图片显示有侧边栏，这通常是在 PageLayout 组件内部实现的 */}
      <div className='px-4 sm:px-10 py-4 overflow-visible'>
        
        {/* 1. 顶部 Tab 切换 */}
        <div className='mb-6 flex justify-center'>
          <CapsuleSwitch
            options={[
              { label: '首页', value: 'home' },
              { label: '收藏夹', value: 'favorites' },
            ]}
            active={activeTab}
            onChange={(value) => setActiveTab(value as 'home' | 'favorites')}
          />
        </div>

        <div className='max-w-[1400px] mx-auto'>
          {activeTab === 'home' ? (
            <>
              {/* 2. 搜索栏区域 (对应图片中部的搜索框+历史记录) */}
              <div className="mb-10 w-full max-w-2xl mx-auto">
                <SearchBarWithHistory />
              </div>

              {/* 3. 继续观看模块 */}
              <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                   <h2 className="text-xl font-bold dark:text-gray-200">继续观看</h2>
                   <button className="text-sm text-gray-500">清空</button>
                </div>
                {/* 重写布局：图片中“继续观看”是平铺网格，而不是横向滚动。
                   如果 ContinueWatching 内部是 Row，你可能需要修改该组件或
                   直接在这里调用 VideoCard。
                */}
                <ContinueWatching gridLayout={true} />
              </section>

              {/* 已移除：热门电影 (hotMovies) 
                已移除：热门剧集 (hotTvShows) 
              */}
            </>
          ) : (
            /* 4. 收藏夹视图 */
            <section className='mb-8'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-bold dark:text-gray-200'>我的收藏</h2>
                {favoriteItems.length > 0 && (
                  <button
                    className='text-sm text-gray-500 hover:underline'
                    onClick={async () => {
                      await clearAllFavorites();
                      setFavoriteItems([]);
                    }}
                  >
                    清空
                  </button>
                )}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6'>
                {favoriteItems.map((item) => (
                  <VideoCard
                    key={item.id + item.source}
                    query={item.search_title}
                    {...item}
                    from='favorite'
                    type={item.episodes > 1 ? 'tv' : 'movie'}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      
      {/* 公告弹窗逻辑保持不变... */}
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense><HomeClient /></Suspense>
  );
}
