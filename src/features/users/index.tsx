import { Main } from '@/components/layout/main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import { User, userListSchema } from './data/schema'
import UsersProvider from './context/users-context'
import useSWR, { SWRResponse } from 'swr';
import { fetcher } from '@/lib/api'
import { ErrorState } from '@/components/error-state'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useTranslation } from 'react-i18next'

interface UsersApiResponse  {
  success: boolean;
  users: User[];
};

export default function Users() {

  const { data, error, isLoading, mutate }: SWRResponse<UsersApiResponse, Error> = useSWR<UsersApiResponse, Error>('/api/users', fetcher)
  const { t } = useTranslation(['users']);


  if (isLoading) return <LoadingSpinner/>
  if (error) return <ErrorState 
    title={t('messages.loadError')} 
    message={typeof error.message === 'string' ? error.message : 'An unknown error occurred.'}
    onRetry={() => void mutate()} 
  />
  if (!data?.success) return <div>{t('messages.noUsers')}</div>;
  
  const userList = userListSchema.parse(data.users);

  return (
    <UsersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('pageTitle')}</h2>
              <p className='text-muted-foreground'>
                {t('pageDescription')}
              </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-6 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}

