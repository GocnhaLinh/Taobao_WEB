import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme';
import { NotificationProvider } from './lib/notification';
import { MainLayout } from './components/layout/MainLayout';
import { AppRoutes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,  // 5 phút: data được coi là "còn mới" — ko gọi lại API
      gcTime: 30 * 60 * 1000,    // 30 phút: giữ cache sau khi unmount
      retry: 1,                  // Chỉ retry 1 lần nếu lỗi
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <BrowserRouter>
              <MainLayout>
                <AppRoutes />
              </MainLayout>
            </BrowserRouter>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
